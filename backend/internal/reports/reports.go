// Package reports holds the case-code and encryption rules for anonymous GBV reports.
package reports

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"regexp"
)

// Case codes look like HEAL-7K2-Q9. The alphabet leaves out 0/O and 1/I/L so a
// survivor can read the code out over the phone without mistakes.
// Keep in sync with lib/reports.ts.
const caseCodeAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

var caseCodePattern = regexp.MustCompile(`^HEAL-[` + caseCodeAlphabet + `]{3}-[` + caseCodeAlphabet + `]{2}$`)

// ValidCaseCode reports whether code has the HEAL-XXX-XX shape.
func ValidCaseCode(code string) bool {
	return caseCodePattern.MatchString(code)
}

// NewCaseCode returns a random case code.
func NewCaseCode() (string, error) {
	b := make([]byte, 5)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := range b {
		b[i] = caseCodeAlphabet[int(b[i])%len(caseCodeAlphabet)]
	}
	return fmt.Sprintf("HEAL-%s-%s", b[:3], b[3:]), nil
}

// Statuses a report moves through; the survivor sees these against her case code.
var Statuses = []string{"received", "contacted", "seen", "closed"}

// Cipher encrypts report contents at rest with AES-256-GCM.
type Cipher struct {
	aead cipher.AEAD
}

// NewCipher derives a 256-bit key from secret. Use a long random secret in production.
func NewCipher(secret string) (*Cipher, error) {
	if len(secret) < 16 {
		return nil, errors.New("report encryption secret must be at least 16 characters")
	}
	key := sha256.Sum256([]byte(secret))
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return &Cipher{aead: aead}, nil
}

// Seal encrypts plaintext and binds it to the case code, so a stored blob can't be
// swapped onto another case. Output is base64(nonce || ciphertext).
func (c *Cipher) Seal(plaintext []byte, caseCode string) (string, error) {
	nonce := make([]byte, c.aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}
	sealed := c.aead.Seal(nonce, nonce, plaintext, []byte(caseCode))
	return base64.StdEncoding.EncodeToString(sealed), nil
}

// Open reverses Seal.
func (c *Cipher) Open(encoded string, caseCode string) ([]byte, error) {
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, err
	}
	n := c.aead.NonceSize()
	if len(raw) < n {
		return nil, errors.New("ciphertext too short")
	}
	return c.aead.Open(nil, raw[:n], raw[n:], []byte(caseCode))
}
