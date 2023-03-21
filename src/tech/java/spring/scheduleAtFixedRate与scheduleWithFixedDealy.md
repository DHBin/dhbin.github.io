---
date: 2019-07-03 17:34:00
---

# scheduleAtFixedRate与scheduleWithFixedDealy

> scheduleAtFixedRate

如果上一个任务的执行时间大于等待时间，任务结束后，下一个任务马上执行

> scheduleWithFixedDealy

如果上个任务的执行时间大于等待时间，任务结束后也会等待相应的时间才执行下一个任务

# 总结

也就是说，不管是scheduleAtFixedRate还是scheduleWithFixedDealy都会等待上一个任务运行结束再进行下一个任务。如果需要并行执行，可以考虑任务中使用异步处理，比如Spring Boot中的@Async