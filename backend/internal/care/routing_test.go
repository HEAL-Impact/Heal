package care

import (
	"reflect"
	"testing"
	"time"
)

func TestRespondersLimitedToConsent(t *testing.T) {
	got := Responders(Emergency, nil, []string{Police, CHP})
	if want := []string{Police, CHP}; !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
	if got := Responders(Emergency, nil, nil); len(got) != 0 {
		t.Fatalf("no consent must alert nobody, got %v", got)
	}
}

func TestRespondersAddNeeds(t *testing.T) {
	got := Responders(CHPFollowUp, []string{"legal"}, []string{CHP, Legal, Police})
	if want := []string{CHP, Legal}; !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestReportGoesToChosenRecipient(t *testing.T) {
	got := Responders(Report, nil, []string{Legal})
	if want := []string{Legal}; !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestCoordinatorNeverInResponders(t *testing.T) {
	for _, r := range Responders(Emergency, []string{"shelter"}, ResponderTypes) {
		if r == Coordinator {
			t.Fatal("coordinator must be alerted separately")
		}
	}
}

func TestDeadlines(t *testing.T) {
	cases := []struct {
		responder, pathway string
		urgent             bool
		want               time.Duration
	}{
		{Police, Emergency, true, 15 * time.Minute},
		{Rescue, Emergency, true, 30 * time.Minute},
		{Facility, FacilityToday, false, 2 * time.Hour},
		{Facility, Refer, false, 24 * time.Hour},
		{CHP, Emergency, true, 2 * time.Hour},
		{CHP, CHPFollowUp, false, 24 * time.Hour},
		{Counsellor, Refer, false, 48 * time.Hour},
		{Legal, Report, false, 72 * time.Hour},
	}
	for _, c := range cases {
		if got := Deadline(c.responder, c.pathway, c.urgent); got != c.want {
			t.Errorf("Deadline(%s,%s,%v) = %v, want %v", c.responder, c.pathway, c.urgent, got, c.want)
		}
	}
}

var network = []Partner{
	{ID: "chp-default", Type: CHP, IsDefault: true, Active: true},
	{ID: "chp-kisumu", Type: CHP, County: "Kisumu", Active: true},
	{ID: "chp-kisumu-kolwa", Type: CHP, County: "Kisumu", Ward: "Kolwa East", Active: true},
	{ID: "chp-siaya", Type: CHP, County: "Siaya", Active: true},
	{ID: "chp-off", Type: CHP, County: "Kisumu", Ward: "Kolwa East", Active: false},
	{ID: "police-kisumu", Type: Police, County: "Kisumu", Active: true},
}

func TestPickPrefersWardThenCountyThenDefault(t *testing.T) {
	if p, _ := Pick(network, CHP, Location{County: "kisumu", Ward: "kolwa east"}, nil); p.ID != "chp-kisumu-kolwa" {
		t.Fatalf("ward match: got %s", p.ID)
	}
	if p, _ := Pick(network, CHP, Location{County: "Kisumu", Ward: "Nyalenda"}, nil); p.ID != "chp-kisumu" {
		t.Fatalf("county match: got %s", p.ID)
	}
	if p, _ := Pick(network, CHP, Location{County: "Nairobi"}, nil); p.ID != "chp-default" {
		t.Fatalf("default route: got %s", p.ID)
	}
}

func TestPickAnonymousUsesDefaultRoute(t *testing.T) {
	if p, ok := Pick(network, CHP, Location{}, nil); !ok || p.ID != "chp-default" {
		t.Fatalf("anonymous case must take the default route, got %v %v", p.ID, ok)
	}
}

func TestPickSkipsTriedAndInactive(t *testing.T) {
	p, ok := Pick(network, CHP, Location{County: "Kisumu", Ward: "Kolwa East"}, map[string]bool{"chp-kisumu-kolwa": true})
	if !ok || p.ID != "chp-kisumu" {
		t.Fatalf("got %s", p.ID)
	}
}

func TestPickNobodyToAlert(t *testing.T) {
	if _, ok := Pick(network, Police, Location{County: "Siaya"}, nil); ok {
		t.Fatal("no Siaya police and no default: expected nobody")
	}
}

func TestAdvanceNeverGoesBack(t *testing.T) {
	if got := Advance(StatusSeen, StatusAccepted); got != StatusSeen {
		t.Fatalf("got %s", got)
	}
	if got := Advance(StatusAlerted, StatusContacted); got != StatusContacted {
		t.Fatalf("got %s", got)
	}
}

func f(v float64) *float64 { return &v }

func TestPickNearestWithinCounty(t *testing.T) {
	ps := []Partner{
		{ID: "far", Type: Facility, County: "Kisumu", Lat: f(-0.30), Lng: f(34.95), Active: true},
		{ID: "near", Type: Facility, County: "Kisumu", Lat: f(-0.10), Lng: f(34.76), Active: true},
	}
	p, _ := Pick(ps, Facility, Location{County: "Kisumu", Lat: f(-0.09), Lng: f(34.77)}, nil)
	if p.ID != "near" {
		t.Fatalf("want nearest, got %s", p.ID)
	}
}

func TestPickAcrossCountyLineWhenClose(t *testing.T) {
	ps := []Partner{
		{ID: "default", Type: Rescue, IsDefault: true, Active: true},
		{ID: "vihiga", Type: Rescue, County: "Vihiga", Lat: f(0.05), Lng: f(34.72), Active: true},
	}
	// A survivor in Kisumu near the Vihiga border: the nearby shelter beats the default route.
	p, _ := Pick(ps, Rescue, Location{County: "Kisumu", Lat: f(-0.02), Lng: f(34.74)}, nil)
	if p.ID != "vihiga" {
		t.Fatalf("got %s", p.ID)
	}
}

func TestPickUsesExtraServices(t *testing.T) {
	ps := []Partner{{ID: "ngo", Type: Counsellor, Services: []string{Legal}, County: "Siaya", Active: true}}
	if p, ok := Pick(ps, Legal, Location{County: "Siaya"}, nil); !ok || p.ID != "ngo" {
		t.Fatal("an NGO offering legal aid as an extra service should be picked")
	}
}

func TestRankKeepsOtherAreasLast(t *testing.T) {
	r := Rank(network, CHP, Location{County: "Kisumu", Ward: "Kolwa East"})
	if r[0].ID != "chp-kisumu-kolwa" || r[len(r)-1].Score != 0 {
		t.Fatalf("unexpected order: %+v", r)
	}
}
