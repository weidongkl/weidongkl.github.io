package microkernel

import (
	"os"
	"path/filepath"
)

// Exportable 旧服务可选实现：导出状态
type Exportable interface {
	ExportState() any
}

// Importable 新服务可选实现：导入状态
type Importable interface {
	ImportState(state any) error
}

// 也可以用一个单独的接口，然后实现接口，从而可以支持多种后端存储
//
//	type StateStore interface {
//		Save(name string, state any) error
//		Load(name string) (any, error)
//		Exists(name string) bool
//	}
type StateStore struct {
	dir     string
	crypter Crypter
}

func NewStateStore(dir string, crypter Crypter) *StateStore {
	return &StateStore{dir: dir, crypter: crypter}
}

func (s *StateStore) path(name string) string {
	return filepath.Join(s.dir, name+".state")
}

func (s *StateStore) Save(name string, state any) error {
	encrypted, err := s.crypter.Encrypt(state)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(s.dir, 0755); err != nil {
		return err
	}
	return os.WriteFile(s.path(name), encrypted, 0600)
}

func (s *StateStore) Load(name string) (any, error) {
	data, err := os.ReadFile(s.path(name))
	if err != nil {
		return nil, err
	}
	return s.crypter.Decrypt(data)
}

func (s *StateStore) Exists(name string) bool {
	_, err := os.Stat(s.path(name))
	return err == nil
}
