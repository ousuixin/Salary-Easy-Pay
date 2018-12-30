# Salary-Easy-Pay
## 简单说明：
本项目开发于Linux环境下，使用webpack打包，前端界面部分采用vue框架

项目所需的局部安装的组件以及版本：见Package.json文件
 
## 其它说明：
truffle环境配置：见truffle.config.js
webpack环境配置：见webpack.config.js

## 运行该项目方法：
方法一：下载所有项目文件（包括node_module中的包，总计80M左右），然后npm run start打包、npm run server运行项目（localhost:8080）
方法二：该方法只能查看界面。仅需下载build下打包好的文件，然后点击index.html可以查看界面（无法连接到私链，因为没有后端）

## 页面说明：
四个页面index.html、introduction.html、employer.html、employee.html，分别是主页、介绍页面、雇主页面、雇员页面

## 数据存储说明：
采用浏览器的localStorage存储雇主创建的合约，一经创建永久保存在浏览器缓存（除非缓存被清空，或更换设备，这时可以通过add contract exist功能重新添加那些之前创建过的合约，这需要雇主自己记清楚合约地址，以防万一出现故障，也能恢复合约。
