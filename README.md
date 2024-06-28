本仓库代码用于实现海洋牧场可视化系统。可以实现数据处理与分析、可视化展示、报警与通知以及用户信息管理功能。

前端界面的相关代码位于seamonitor_final中除了backend的文件夹以及文件内。

后端的相关代码位于seamonitor_final/backend文件夹中。后端系统相关数据位于backend/data中，用户相关数据位于backend/register中。

前端服务器启动：在seamonitor_final文件夹中输入cmd打开控制台，输入命令“npm run serve”即可打开前端服务器，根据提示访问 http://localhost:8080/或者具体http://ip:8080/均可访问网站。

后端服务器启动：在backend文件夹中输入cmd打开控制台，输入命令“node app.js”即可打开后端服务器。

注：（1）运行过程中如果出现服务器bug，可以通过Ctrl+C关闭服务器，利用和之前相同的命令即可重启服务器
    （2）初次运行本仓库代码，可能会出现未安装依赖项等的报错，按照提示安装即可正确运行。
     如果再遇到问题，可以参考此文章https://blog.csdn.net/qq_45475788/article/details/132154497?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171957820316800222888702%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171957820316800222888702&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-132154497-null-null.142^v100^pc_search_result_base7&utm_term=%E5%A6%82%E4%BD%95%E8%BF%90%E8%A1%8C%E5%88%AB%E4%BA%BA%E7%9A%84vue%E9%A1%B9%E7%9B%AE&spm=1018.2226.3001.4187。
