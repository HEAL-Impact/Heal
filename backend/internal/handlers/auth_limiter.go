package handlers

import (
	"sync"
	"time"
)

// attemptLimiter slows down password guessing: after max failures inside the
// window for a key (an email, or an IP address), that key is refused until the
// oldest failure ages out. It is in memory, so it resets when the API restarts.
type attemptLimiter struct {
	mu     sync.Mutex
	max    int
	window time.Duration
	fails  map[string][]time.Time
}

func newAttemptLimiter(max int, window time.Duration) *attemptLimiter {
	return &attemptLimiter{max: max, window: window, fails: map[string][]time.Time{}}
}

func (l *attemptLimiter) prune(key string, now time.Time) []time.Time {
	kept := l.fails[key][:0]
	for _, t := range l.fails[key] {
		if now.Sub(t) < l.window {
			kept = append(kept, t)
		}
	}
	if len(kept) == 0 {
		delete(l.fails, key)
	} else {
		l.fails[key] = kept
	}
	return kept
}

// Blocked reports whether the key is locked out and for how long.
func (l *attemptLimiter) Blocked(key string) (bool, time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	f := l.prune(key, now)
	if len(f) < l.max {
		return false, 0
	}
	return true, l.window - now.Sub(f[0])
}

func (l *attemptLimiter) Fail(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.fails[key] = append(l.prune(key, time.Now()), time.Now())
}

func (l *attemptLimiter) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.fails, key)
}
