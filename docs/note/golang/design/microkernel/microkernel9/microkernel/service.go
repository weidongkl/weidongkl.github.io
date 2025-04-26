package microkernel

// Service 定义微内核的服务接口
// 使用接口定义代替固定的struct,低耦合设计。
type Service interface {
	Start() error
	Stop() error
	Name() string
	Handle(Event) Reply
	// Dependencies 返回依赖服务名称
	Dependencies() []string // 新增接口
}

// ServiceState 定义微内核服务状态
type ServiceState int

// 使用iota枚举类型，自动计算枚举值
const (
	Created ServiceState = iota
	Running
	Stopped
)

// ServiceState.String()
func (s ServiceState) String() string {
	// 状态转换成字符串
	// 其中[...]表示让编译器自动计算数组的长度
	return [...]string{"Created", "Running", "Stopped"}[s]
}

// serviceMeta 定义微内核服务元数据
type serviceMeta struct {
	svc   Service
	state ServiceState
	// 依赖服务名称
	deps []string
}
