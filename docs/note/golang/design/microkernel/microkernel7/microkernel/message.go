package microkernel

// Event 定义内核事件（用于服务间通信）
type Event struct {
	To      string
	From    string
	Type    string
	Content string
	// 增加响应通道,使用 chan Reply，提高回复的灵活性
	ReplyCh chan Reply
	// 可选：超时时间
	TimeoutMs int
}

// Reply 定义内核事件回复
type Reply struct {
	Code    int    // 0 表示成功，非0表示错误码
	Message string // 描述信息
	Data    string // 可选负载
}
