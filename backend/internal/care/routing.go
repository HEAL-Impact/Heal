// Package care holds the care-routing rules: which responders a case needs,
// which partner receives each alert, and how long each one has to respond.
// It has no database access so the rules can be tested on their own.
// The rules follow the approved workflow write-up (Workflows 4 and 6).
package care

import (
	"math"
	"sort"
	"strings"
	"time"
)

// Responder types a case can be routed to.
const (
	CHP         = "chp"
	Rescue      = "rescue_centre"
	Facility    = "facility"
	Police      = "police_desk"
	Counsellor  = "counsellor"
	Legal       = "legal_aid"
	Coordinator = "coordinator"
)

// ResponderTypes lists every type, in the order alerts are sent.
var ResponderTypes = []string{Rescue, Police, Facility, CHP, Counsellor, Legal, Coordinator}

func IsResponderType(t string) bool {
	for _, r := range ResponderTypes {
		if r == t {
			return true
		}
	}
	return false
}

// Pathways a case can follow.
const (
	Emergency     = "emergency"
	FacilityToday = "facility_today"
	Refer         = "refer"
	CHPFollowUp   = "chp_follow_up"
	Report        = "report"
)

var pathways = map[string]bool{Emergency: true, FacilityToday: true, Refer: true, CHPFollowUp: true, Report: true}

func IsPathway(p string) bool { return pathways[p] }

// Needs a survivor can name, and the responder that meets each one.
var needResponder = map[string]string{
	"shelter":      Rescue,
	"police":       Police,
	"medical":      Facility,
	"srhr":         Facility,
	"legal":        Legal,
	"psychosocial": Counsellor,
}

func IsNeed(n string) bool { _, ok := needResponder[n]; return ok }

// recommended responders for each pathway, before the survivor's needs and consent.
var recommended = map[string][]string{
	Emergency:     {Rescue, Police, CHP},
	FacilityToday: {Facility, CHP},
	Refer:         {Counsellor, CHP},
	CHPFollowUp:   {CHP},
	Report:        {},
}

// Responders returns the responder types to alert: those the pathway and the
// survivor's needs call for, limited to the ones they consented to. The coordinator is not
// in the list; it watches every case and is alerted separately.
func Responders(pathway string, needs, consent []string) []string {
	want := map[string]bool{}
	for _, t := range recommended[pathway] {
		want[t] = true
	}
	for _, n := range needs {
		if t, ok := needResponder[n]; ok {
			want[t] = true
		}
	}
	agreed := map[string]bool{}
	for _, t := range consent {
		agreed[t] = true
	}
	var out []string
	for _, t := range ResponderTypes {
		// A report goes to whoever the survivor chose, even when the pathway recommends nobody.
		if t != Coordinator && agreed[t] && (want[t] || pathway == Report) {
			out = append(out, t)
		}
	}
	return out
}

// Deadline is how long a responder has to accept an alert (Workflow 6 table).
func Deadline(responder, pathway string, urgent bool) time.Duration {
	switch responder {
	case Rescue:
		return 30 * time.Minute
	case Police:
		if urgent {
			return 15 * time.Minute
		}
		return 24 * time.Hour
	case Facility:
		if pathway == FacilityToday || urgent {
			return 2 * time.Hour
		}
		return 24 * time.Hour
	case CHP:
		if urgent {
			return 2 * time.Hour
		}
		return 24 * time.Hour
	case Counsellor:
		return 48 * time.Hour
	case Legal:
		return 72 * time.Hour
	default: // coordinator (receives reports sent to the 1195 hotline, and escalations)
		if urgent {
			return 15 * time.Minute
		}
		return 24 * time.Hour
	}
}

func norm(s string) string { return strings.ToLower(strings.TrimSpace(s)) }

// Partner is the routing view of a care partner.
type Partner struct {
	ID        string
	Type      string   // main service
	Services  []string // other responder types it also offers
	County    string
	Ward      string
	Lat, Lng  *float64 // approximate location, if known
	IsDefault bool
	Active    bool
}

// Offers reports whether the partner provides a responder type.
func (p Partner) Offers(responder string) bool {
	if p.Type == responder {
		return true
	}
	for _, s := range p.Services {
		if s == responder {
			return true
		}
	}
	return false
}

// Location is where a case is (all parts optional; anonymous cases have none).
type Location struct {
	County, Ward string
	Lat, Lng     *float64
}

// NearbyKM: a partner this close counts as local even across a county line.
const NearbyKM = 25.0

// DistanceKM is the great-circle distance, or nil when either point is unknown.
func DistanceKM(aLat, aLng, bLat, bLng *float64) *float64 {
	if aLat == nil || aLng == nil || bLat == nil || bLng == nil {
		return nil
	}
	const r = 6371.0
	rad := func(d float64) float64 { return d * math.Pi / 180 }
	dLat, dLng := rad(*bLat-*aLat), rad(*bLng-*aLng)
	h := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(rad(*aLat))*math.Cos(rad(*bLat))*math.Sin(dLng/2)*math.Sin(dLng/2)
	d := 2 * r * math.Asin(math.Sqrt(h))
	return &d
}

// Ranked is a partner with how well it matches a location.
type Ranked struct {
	Partner
	Score int      // 3 same ward, 2 same county or within NearbyKM, 1 default route, 0 elsewhere
	KM    *float64 // distance from the case, when both locations are known
}

// Rank orders every active partner offering the responder type for a location:
// best score first, then nearest, then input order. Score 0 partners (other
// areas) are included so a directory can show them; Pick never uses them.
func Rank(partners []Partner, responder string, loc Location) []Ranked {
	county, ward := norm(loc.County), norm(loc.Ward)
	var out []Ranked
	for _, p := range partners {
		if !p.Active || (responder != "" && !p.Offers(responder)) {
			continue
		}
		km := DistanceKM(loc.Lat, loc.Lng, p.Lat, p.Lng)
		pc, pw := norm(p.County), norm(p.Ward)
		score := 0
		switch {
		case county != "" && pc == county && ward != "" && pw == ward:
			score = 3
		case county != "" && pc == county, km != nil && *km <= NearbyKM:
			score = 2
		case p.IsDefault:
			score = 1
		}
		out = append(out, Ranked{p, score, km})
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].Score != out[j].Score {
			return out[i].Score > out[j].Score
		}
		a, b := out[i].KM, out[j].KM
		if a != nil && b != nil {
			return *a < *b
		}
		return a != nil && b == nil
	})
	return out
}

// Pick chooses the partner to alert: same ward and county first, then same
// county (or within NearbyKM), then the default route for that type; nearest
// wins a tie. A case with no location (anonymous) always takes the default
// route. Partners in exclude (already tried) are skipped. ok is false when
// there is nobody to alert; the caller then escalates to the coordinator.
func Pick(partners []Partner, responder string, loc Location, exclude map[string]bool) (Partner, bool) {
	for _, r := range Rank(partners, responder, loc) {
		if r.Score > 0 && !exclude[r.ID] {
			return r.Partner, true
		}
	}
	return Partner{}, false
}

// Case statuses, in the order a case normally moves through them.
const (
	StatusCreated    = "created"
	StatusAlerted    = "alerted"
	StatusAccepted   = "accepted"
	StatusContacted  = "contacted"
	StatusSeen       = "seen"
	StatusFollowUp   = "follow_up"
	StatusClosed     = "closed"
	StatusDeclined   = "declined_by_survivor"
	StatusLost       = "lost_to_follow_up"
	MaxFailedContact = 3
)

var statusRank = map[string]int{
	StatusCreated: 0, StatusAlerted: 1, StatusAccepted: 2, StatusContacted: 3,
	StatusSeen: 4, StatusFollowUp: 5, StatusClosed: 6, StatusDeclined: 6, StatusLost: 6,
}

// Advance returns the later of two statuses, so a case never moves backwards
// when several partners update it in a different order.
func Advance(current, next string) string {
	if statusRank[next] > statusRank[current] {
		return next
	}
	return current
}

// IsOpen reports whether a case still needs action.
func IsOpen(status string) bool { return statusRank[status] < 6 }
