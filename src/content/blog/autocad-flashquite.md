---
draft: false
date: "02-01-2018"
title: "AutoCAD闪退（包括重装依旧闪退）的解决方案"
description: "闪退多半是 ADLM 许可文件损坏：清掉 FLEXnet 目录里的许可文件让 CAD 重新生成即可，不用重装，更不用删注册表。"
category: "engineering"
tags: ["AutoCAD", "CAD", "故障排查"]
author: "lhZhang"
---

双击AutoCAD时，AutoCAD启动画面在屏幕上一闪，然后程序马上关闭，没有任何错误信息显示，程序和机器没有其它响应。重启电脑问题如故，卸载CAD再重装、清理注册表和垃圾文件问题依旧，真无它法吗？？但其实问题是很简单的。

> 本经验适用于Win10系统AutoCAD[1]出现闪退现象，特别在激活操作故障后，甚至重装CAD也无济于事，闪退依旧，无法操作激活。
> 特别提醒，千万不要看其它经验或文章的删除注册表信息操作，会让本来简单的事情复杂化。请按照本经验操作，简单易用能成功！

![闪退现象](/images/blog/autocad-flashquite/01.jpg)

### 方法/步骤:

1. AutoCAD闪退原因，可能是ADLM许可文件已经被破坏，需要修复才行，先要去掉文件夹选项中的隐藏选项，找到FLEXnet目录：

![FLEXnet 目录](/images/blog/autocad-flashquite/02.jpg)

FLEXnet目录位置： C:\ProgramData\FLEXnet

2. 在打开的FLEXnet目录，删除里面的所有文件，删除后，重新打开CAD，注册后会生成新的adskflex\_\*\_tsf.data。

以下仅供参考 文件名字里的数字可能不一样。

默认位置C:\ProgramData\FLEXnet删除里面的文件

第一个文件：adskflex\_00691b00\_event.log

第二个文件：adskflex\_00691b00\_tsf.data

第三个文件：adskflex\_00691b00\_tsf.data\_backup.001

![删除目录内文件](/images/blog/autocad-flashquite/03.jpg)

> [1] AutoCAD软件是由美国欧特克有限公司（Autodesk）出品的一款自动计算机辅助设计软件，可以用于绘制二维制图和基本三维设计，通过它无需懂得编程，即可自动制图，因此它在全球广泛使用，可以用于土木建筑，装饰装潢，工业制图，工程制图，电子工业，服装加工等多方面领域。
