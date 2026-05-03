该目录包含 ArchSpine 仓库索引与规则执行系统的示例配置文件。示例可分为三类：**单元定义**（spine-folder-unit.example.json、spine-project-unit.example.json、spine-unit.example.json）、**索引元数据**（spine-manifest.example.json）以及**架构规则**（spine-rule-document.example.json、spine-rule.example.md）。  

重要实现领域涵盖仓库索引流水线（文件夹单元和项目单元定义模块容器及溯源追踪）、同步与文件清单（清单文件跟踪同步状态、内容哈希并支持反向索引）以及领域边界强制（规则禁止应用代码直接导入数据库层）。  

具体子模块包括：  
- **spine-folder-unit.example.json** – 定义索引流水线的应用模块容器。  
- **spine-manifest.example.json** – 提供同步元数据、文件清单及反向索引查找。  
- **spine-project-unit.example.json** – 描述项目元数据、模块结构（src/docs）和生成溯源。  
- **spine-rule-document.example.json** – 强制禁止直接导入数据库层的规则。  
- **spine-rule.example.md** – 规定带有作用域、严重级别和理由的强制规则。  
- **spine-unit.example.json** – 模拟包含登录/注销功能的认证入口模块。