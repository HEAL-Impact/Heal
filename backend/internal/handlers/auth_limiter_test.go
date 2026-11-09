package handlers

import (
	"testing"
	"time"
)

func TestLimiterBlocksAfterMaxAndResets(t *testing.T) {
	l := newAttemptLimiter(3, time.Minute)
	for i := 0; i < 3; i++ {
		if blocked, _ := l.Blocked("a@b.c"); blocked {
			t.Fatalf("blocked too early at %d", i)
		}
		l.Fail("a@b.c")
	}
	blocked, wait := l.Blocked("a@b.c")
	if !blocked || wait <= 0 || wait > time.Minute {
		t.Fatalf("expected block with wait, got %v %v", blocked, wait)
	}
	if b, _ := l.Blocked("other@b.c"); b {
		t.Fatal("other keys must not be blocked")
	}
	l.Reset("a@b.c")
	if b, _ := l.Blocked("a@b.c"); b {
		t.Fatal("reset should unblock")
	}
}

func TestLimiterWindowExpires(t *testing.T) {
	l := newAttemptLimiter(1, 20*time.Millisecond)
	l.Fail("k")
	if b, _ := l.Blocked("k"); !b {
		t.Fatal("expected block")
	}
	time.Sleep(30 * time.Millisecond)
	if b, _ := l.Blocked("k"); b {
		t.Fatal("block should expire")
	}
}

func TestValidEmail(t *testing.T) {
	for e, want := range map[string]bool{
		"a@b.co": true, "jane.doe@heal-impact.org": true, "nope": false, "a@b": false,
		"Jane <a@b.co>": false, "a b@c.co": false, "": false,
	} {
		if got := validEmail(e); got != want {
			t.Errorf("validEmail(%q) = %v, want %v", e, got, want)
		}
	}
}
