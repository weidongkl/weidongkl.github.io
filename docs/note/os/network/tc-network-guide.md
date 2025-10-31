# TC (Traffic Control) 网络模拟

## 1. 基础概念

### 1.1. 什么是 TC
TC (Traffic Control) 是 Linux 内核提供的流量控制工具，可以模拟各种网络条件。

### 1.2. 基本命令结构
```bash
# 基本语法
tc qdisc [add|change|replace|del] dev <设备> [root|parent <句柄>] [网络模拟参数]

# 查看当前规则
tc qdisc show dev <设备>

# 删除所有规则
tc qdisc del dev <设备> root
```

## 2. 网络延迟模拟

### 2.1. 固定延迟
```bash
# 添加 100ms 固定延迟
tc qdisc add dev eth0 root netem delay 100ms

# 修改延迟为 200ms
tc qdisc change dev eth0 root netem delay 200ms

# 替换现有规则
tc qdisc replace dev eth0 root netem delay 150ms
```

### 2.2. 随机延迟波动
```bash
# 2.2.1. 100ms ± 20ms 随机波动
tc qdisc add dev eth0 root netem delay 100ms 20ms

# 2.2.2. 100ms ± 50ms，延迟相关性 25%
tc qdisc add dev eth0 root netem delay 100ms 50ms 25%
# 0% 的延迟相关性，表示每个延迟都是随机生成，和上一个没有关系。默认是0%
# 25% 前数据包延迟有25%的可能性跟随前一个数据包的延迟趋势
```

### 2.3. 延迟分布模型
```bash
# 2.3.1. 正态分布延迟
tc qdisc add dev eth0 root netem delay 100ms 30ms distribution normal

# 2.3.2. 帕累托分布延迟
tc qdisc add dev eth0 root netem delay 100ms 30ms distribution pareto
```

## 3. 其他网络条件模拟

### 3.1. 丢包模拟
```bash
# 3.1.1. 5% 丢包
tc qdisc add dev eth0 root netem loss 5%

# 3.1.2. 5% 丢包，相关性 25%
tc qdisc add dev eth0 root netem loss 5% 25%
```

### 3.2. 带宽限制
```bash
# 3.2.1. 限制为 1Mbps
tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# 3.2.2. 使用 HTB 进行精细控制
tc qdisc add dev eth0 root handle 1: htb default 10
tc class add dev eth0 parent 1: classid 1:1 htb rate 10mbit
```

### 3.3. 数据包损坏和重复
```bash
# 3.3.1. 2% 的数据包损坏
tc qdisc add dev eth0 root netem corrupt 2%

# 3.3.2. 3% 的数据包重复
tc qdisc add dev eth0 root netem duplicate 3%

# 3.3.3. 5% 的数据包重排序
tc qdisc add dev eth0 root netem delay 50ms reorder 10%
```

## 4. 组合网络条件

### 4.1. 复杂网络模拟
```bash
# 4.1.1. 延迟 + 丢包组合
tc qdisc add dev eth0 root netem delay 100ms loss 3%

# 4.1.2. 完整恶劣网络模拟
tc qdisc add dev eth0 root netem \
    delay 300ms 100ms 25% \
    loss 15% 30% \
    duplicate 2% \
    corrupt 1% \
    reorder 10% 50%
```

### 4.2. 特定场景模拟
```bash
# 4.2.1. 移动网络模拟
tc qdisc add dev eth0 root netem \
    delay 100ms 50ms 25% \
    loss 1% 30% \
    duplicate 0.5%

# 4.2.2. 卫星链路模拟
tc qdisc add dev eth0 root netem \
    delay 500ms 100ms \
    loss 0.5% \
    duplicate 0.1%
```

## 5. 针对特定流量的控制

### 5.1. 基于端口的控制
```bash
# 5.1.1. 创建分类队列
tc qdisc add dev eth0 root handle 1: prio
tc qdisc add dev eth0 parent 1:1 handle 10: netem delay 100ms
tc qdisc add dev eth0 parent 1:2 handle 20: netem delay 50ms

# 5.1.2. HTTP 流量高延迟
tc filter add dev eth0 protocol ip parent 1: prio 1 u32 match ip dport 80 0xffff flowid 1:1

# 5.1.3. SSH 流量中等延迟  
tc filter add dev eth0 protocol ip parent 1: prio 2 u32 match ip dport 22 0xffff flowid 1:2
```

### 5.2. 基于 IP 的控制
```bash
# 5.2.1. 为特定目标 IP 添加延迟
tc filter add dev eth0 protocol ip parent 1: prio 1 u32 match ip dst 192.168.1.100 flowid 1:1
```

## 6. 延迟效果验证方法

### 6.1. 基础 ping 测试
```bash
# 6.1.1. 基本延迟测试
ping -c 10 google.com

# 6.1.2. 显示时间戳
ping -D -c 10 8.8.8.8

# 6.1.3. 简化统计输出
ping -c 20 -q 8.8.8.8
```

### 6.2. 解析 ping 输出
```
--- 8.8.8.8 ping statistics ---
10 packets transmitted, 10 received, 0% packet loss, time 9014ms
rtt min/avg/max/mdev = 98.123/102.456/105.789/2.123 ms
```
- **min**: 最小延迟
- **avg**: 平均延迟  
- **max**: 最大延迟
- **mdev**: 延迟波动

### 6.3. 路径分析工具
```bash
# 6.3.1. 显示路径每跳延迟
traceroute www.baidu.com

# 6.3.2. 实时路径监控
mtr google.com

# 6.3.3. 生成报告
mtr -r -c 10 google.com
```

## 7. TCP/HTTP 延迟测试

### 7.1. curl 详细时间分析
```bash
# 7.1.1. 显示连接各阶段时间
curl -w "
DNS解析: %{time_namelookup}
连接建立: %{time_connect}
TLS握手: %{time_appconnect}
传输开始: %{time_starttransfer}
总时间: %{time_total}
" -o /dev/null -s https://www.baidu.com
```

### 7.2. 使用时间模板文件
```bash
# 7.2.1. 创建时间格式文件
cat > time_format.txt << EOF
时间统计:
DNS解析: %{time_namelookup} s
连接建立: %{time_connect} s
TLS握手: %{time_appconnect} s
首字节: %{time_starttransfer} s
总时间: %{time_total} s
EOF

# 7.2.2. 使用格式文件
curl -w "@time_format.txt" -o /dev/null -s https://google.com
```

## 8. 专业性能测试

### 8.1. iperf3 测试
```bash
# 8.1.1. 服务器端
iperf3 -s

# 8.1.2. 客户端测试带宽和延迟
iperf3 -c server_ip -t 30 -i 1

# 8.1.3. UDP 测试（更准确反映延迟）
iperf3 -c server_ip -u -b 10M -t 30
```

### 8.2. 实时监控命令
```bash
# 8.2.1. 查看 TC 规则状态
tc -s qdisc show dev eth0

# 8.2.2. 实时监控队列统计
watch -n 1 'tc -s qdisc show dev eth0'

# 8.2.3. 查看详细包统计
tc -s qdisc ls dev eth0
```

## 9. 自动化测试脚本

### 9.1. 完整的对比测试脚本
```bash
#!/bin/bash
TARGET="8.8.8.8"
INTERFACE="eth0"
TEST_DELAYS=("50ms" "100ms" "200ms")

echo "=== 网络延迟模拟测试 ==="
echo "目标主机: $TARGET"
echo "网络接口: $INTERFACE"
echo

# 9.1.1. 基准测试
echo "1. 基准测试（无延迟模拟）:"
ping -c 5 -q $TARGET | grep rtt
echo

for delay in "${TEST_DELAYS[@]}"; do
    echo "2. 设置 $delay 延迟:"
    tc qdisc add dev $INTERFACE root netem delay $delay 2>/dev/null
    
    # 9.1.2. 测试当前延迟
    echo "当前延迟效果:"
    ping -c 5 -q $TARGET | grep rtt
    
    # 9.1.3. 测试 TCP 连接延迟
    echo "TCP 连接延迟:"
    curl -w "总时间: %{time_total}s\n" -o /dev/null -s http://$TARGET
    
    echo
    sleep 2
    
    # 9.1.4. 清理规则
    tc qdisc del dev $INTERFACE root 2>/dev/null
done

echo "=== 测试完成 ==="
```

### 9.2. 延迟波动验证脚本
```bash
#!/bin/bash
TARGET="8.8.8.8"
INTERFACE="eth0"
DURATION=30

echo "测试延迟波动效果..."
echo "设置: 100ms ± 50ms 延迟波动"
tc qdisc add dev $INTERFACE root netem delay 100ms 50ms

echo "开始收集延迟数据..."
ping -c $DURATION $TARGET | grep 'time=' | awk -F'[= ]' '{print $8}' > latency_data.txt

echo "延迟统计:"
awk '
{
    delays[NR] = $1
    sum += $1
}
END {
    if (NR > 0) {
        avg = sum / NR
        asort(delays)
        mid = int(NR / 2)
        if (NR % 2) {
            median = delays[mid + 1]
        } else {
            median = (delays[mid] + delays[mid + 1]) / 2
        }
        print "样本数: " NR
        print "平均延迟: " avg " ms"
        print "中位数: " median " ms" 
        print "最小延迟: " delays[1] " ms"
        print "最大延迟: " delays[NR] " ms"
        print "波动范围: " (delays[NR] - delays[1]) " ms"
    }
}' latency_data.txt

# 9.2.1. 清理
tc qdisc del dev $INTERFACE root 2>/dev/null
rm latency_data.txt
```

## 10. 高级监控和分析

### 10.1. 实时延迟监控
```bash
# 10.1.1. 持续监控并记录
ping $TARGET | while read pong; do 
    echo "$(date '+%H:%M:%S'): $pong"
done

# 10.1.2. 提取延迟数值监控
ping $TARGET | awk -F'[= ]' '/time=/ {print strftime("%H:%M:%S") " - " $(NF-1) "ms"}'
```

### 10.2. TC 统计信息解读
```bash
# 10.2.1. 查看详细统计
tc -s qdisc show dev eth0

# 10.2.2. 输出示例解读:
qdisc netem 8001: root refcnt 2 limit 1000 delay 100.0ms  10.0ms
 Sent 123456 bytes 1000 pkt (dropped 50, overlimits 0 requeues 0)
 
# 10.2.3. 关键指标:
# - Sent: 发送的数据量和包数
# - dropped: 丢包数量
# - overlimits: 超过限制的包数
```

## 11. 故障排除和恢复

### 11.1. 常见问题处理
```bash
# 11.1.1. 强制删除所有规则
tc qdisc del dev eth0 root 2>/dev/null || true

# 11.1.2. 检查设备状态
ip link show dev eth0

# 11.1.3. 验证规则是否生效
tc qdisc show dev eth0
```

### 11.2. 安全恢复脚本
```bash
#!/bin/bash
INTERFACE="eth0"

echo "正在恢复网络设置..."
tc qdisc del dev $INTERFACE root 2>/dev/null

# 11.2.1. 验证恢复
echo "当前网络规则:"
tc qdisc show dev $INTERFACE

echo "网络延迟测试:"
ping -c 3 -q 8.8.8.8 | grep rtt
```

## 12. 最佳实践建议

**测试前准备**

- **测试前备份**: 记录原始网络设置

- **环境检查**: 确认网络接口和设备状态

**测试执行**

- **逐步验证**: 从简单延迟开始，逐步增加复杂度
- **多工具验证**: 使用 ping、curl、traceroute 等多种工具交叉验证

**生产环境注意事项**

- **生产环境谨慎**: 在生产环境测试时设置超时和自动恢复
- **文档记录**: 记录测试参数和结果，便于问题排查

**性能监控**

- **实时监控**: 使用 watch 命令实时监控 TC 统计信息
- **数据记录**: 保存测试数据用于后续分析

