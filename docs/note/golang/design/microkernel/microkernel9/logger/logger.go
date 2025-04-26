package logger

import (
	"fmt"
	"io"
	"sync"
	"time"
)

type LogLevel int

const (
	INFO LogLevel = iota
	WARN
	ERROR
)

type Logger struct {
	mu      sync.Mutex
	level   LogLevel
	service string
	out     io.Writer
}

// NewLogger 初步的日志实现，可以直接在该模块内部完成设置，其他模块调用唯一的logger对象
func NewLogger(service string, level LogLevel, out io.Writer) *Logger {
	return &Logger{
		service: service,
		level:   level,
		out:     out,
	}
}

func (l *Logger) logf(level LogLevel, format string, args ...any) {
	if level < l.level {
		return
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	levelStr := [...]string{"INFO", "WARN", "ERROR"}[level]
	msg := fmt.Sprintf(format, args...)
	ts := time.Now().Format("2006-01-02 15:04:05.000")
	fmt.Fprintf(l.out, "[%s] [%s] [%s] %s\n", ts, levelStr, l.service, msg)
}

func (l *Logger) Infof(format string, args ...any) {
	l.logf(INFO, format, args...)
}
func (l *Logger) Warnf(format string, args ...any) {
	l.logf(WARN, format, args...)
}
func (l *Logger) Errorf(format string, args ...any) {
	l.logf(ERROR, format, args...)
}
