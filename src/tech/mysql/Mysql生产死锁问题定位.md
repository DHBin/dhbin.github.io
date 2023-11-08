---
date: 2023-07-03 00:00:00
category:
  - Mysql
tag:
  - Mysql
  - deadlock
---

# Mysql生产死锁问题定位

生产上一个消费mq消息的服务出现了死锁问题，通过命令获取到的mysql日志如下：

<!-- more -->

```
=====================================
2023-06-28 09:53:31 0x7f6ca09ff700 INNODB MONITOR OUTPUT
=====================================
Per second averages calculated from the last 33 seconds
-----------------
BACKGROUND THREAD
-----------------
srv_master_thread loops: 266272 srv_active, 0 srv_shutdown, 10930955 srv_idle
srv_master_thread log flush and writes: 0
----------
SEMAPHORES
----------
OS WAIT ARRAY INFO: reservation count 1616097
OS WAIT ARRAY INFO: signal count 2061102
RW-shared spins 2022619, rounds 2302798, OS waits 232184
RW-excl spins 1889177, rounds 12494241, OS waits 93099
RW-sx spins 351310, rounds 2586746, OS waits 51797
Spin rounds per wait: 1.14 RW-shared, 6.61 RW-excl, 7.36 RW-sx
------------------------
LATEST DETECTED DEADLOCK
------------------------
2023-06-27 21:38:31 0x7f6ca0387700
*** (1) TRANSACTION:
TRANSACTION 96847162, ACTIVE 0 sec inserting
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 1
MySQL thread id 3169079, OS thread handle 140104549562112, query id 320067350 10.245.0.173 mdm update
insert into table (...) values (...)
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table `db`.`table` trx id 96847162 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 10; hex 32323232323437393237; asc 2222247927;;
 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);

*** (2) TRANSACTION:
TRANSACTION 96847161, ACTIVE 0 sec inserting
mysql tables in use 1, locked 1
3 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 1
MySQL thread id 3169075, OS thread handle 140104521250560, query id 320067349 10.245.0.173 mdm update
insert into table (...) values (...)
*** (2) HOLDS THE LOCK(S):
RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table `db`.`table` trx id 96847161 lock_mode X locks gap before rec
Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 10; hex 32323232323437393237; asc 2222247927;;
 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);

*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table `db`.`table` trx id 96847161 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 10; hex 32323232323437393237; asc 2222247927;;
 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);

*** WE ROLL BACK TRANSACTION (2)

```

代码sql

```sql

# 删除数据
delete `db`.`table` where org_code = ?

# 新增数据
insert into `db`.`table` values(...)

```

原因：org_code这个字段上存在索引，RC事务级别会产生间隙锁把相邻的位置锁住，多条消息过来多线程消费导致锁相互持有最终导致死锁

解决方法: 在业务允许的情况下，减低mysql事务隔离级别到RR