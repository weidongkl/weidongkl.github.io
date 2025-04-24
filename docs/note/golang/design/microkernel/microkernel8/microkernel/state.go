package microkernel

// Exportable 旧服务可选实现：导出状态
type Exportable interface {
	ExportState() any
}

// Importable 新服务可选实现：导入状态
type Importable interface {
	ImportState(state any) error
}
