---
date: 2020-08-06 14:09:00
---

# Java注解处理器、语法树修剪

## 依赖

- auto-service 方便生成Processor
- qdox 解析java文件
- tools.jar javac工具，修改语法树，也支持遍历javadoc

### maven使用tools.jar

```xml
<profiles>
        <profile>
            <id>default-tools.jar</id>
            <activation>
                <property>
                    <name>java.vendor</name>
                    <value>Sun Microsystems Inc.</value>
                </property>
            </activation>
            <dependencies>
                <dependency>
                    <groupId>com.sun</groupId>
                    <artifactId>tools</artifactId>
                    <version>1.8</version>
                    <scope>system</scope>
                    <systemPath>${java.home}/../lib/tools.jar</systemPath>
                </dependency>
            </dependencies>
        </profile>
    </profiles>
```

### autoservice

```xml
        <dependency>
            <groupId>com.google.auto.service</groupId>
            <artifactId>auto-service</artifactId>
            <version>1.0-rc7</version>
        </dependency>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>8</source>
                    <target>8</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>com.google.auto.service</groupId>
                            <artifactId>auto-service</artifactId>
                            <version>1.0-rc7</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

## 编译器

### 种类

- Javac
- eclipse（ecj）
- Groovy-Eclipse
- Ajc

## Java Annotation Processor

javax.annotation.processing.Processor接口有一个实现抽象类AbstractProcessor，默认实现了以下方法，提供注解实现

- Set getSupportedOptions() -- @*SupportedOptions*
- Set getSupportedAnnotationTypes(); -- @*SupportedAnnotationTypes*
- *SourceVersion getSupportedSourceVersion(); -- @SupportedSourceVersion*

*注：注解配置降低了代码的复杂度*

### 例子

```java
// 生成配置文件META-INF/services/xxxx
@AutoService(Processor.class)
// 所有注解(必须要声明)
@SupportedAnnotationTypes("*")
// 版本
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class DemoProcessor extends AbstractProcessor {
    
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        // 如果返回true，不会流到下面的处理器
        return false;
    }

}
```

### 使用Spi

在注解处理器中使用spi，依赖也需要像注解处理器一样的方式引入，不然加载不到

### 获取JCCompilationUnit

JCCompilationUnit代表一个完整Class

```java
	private JCCompilationUnit toUnit(Element element) {
		TreePath path = null;
		if (trees != null) {
			try {
				path = trees.getPath(element);
			} catch (NullPointerException ignore) {
				// Happens if a package-info.java dowsn't conatin a package declaration.
				// https://github.com/rzwitserloot/lombok/issues/2184
				// We can safely ignore those, since they do not need any processing
			}
		}
		if (path == null) return null;
		
		return (JCCompilationUnit) path.getCompilationUnit();
	}
```

## element转tree

```java
com.sun.source.util.Trees

trees = Trees.instance(javacProcessingEnv);
// 获取Tree
tress.getTree(element)
```

## Tree获取element

Tree中的sym变量就是element对象

## 资料

[java注解处理器——在编译期修改语法树](https://blog.csdn.net/a_zhenzhen/article/details/86065063) 

[annotationProcessor 自动生成代码(上)](https://www.jianshu.com/p/c8c113a1b975) 

[annotationProcessor 自动生成代码(下)](https://www.jianshu.com/p/676537664d04)

[编译期修改Class](https://blog.csdn.net/dap769815768/article/details/90448451) 

[Lombok原理分析与功能实现](https://blog.mythsman.com/post/5d2c11c767f841464434a3bf/) 

[Compiler Tree Api](https://docs.oracle.com/javase/8/docs/jdk/api/javac/tree/index.html) 