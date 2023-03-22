---
date: 2018-08-21 13:22:00
category:
  - Java
---

# JAVA 8 反射获取参数名

# 前言

在JDK8之前javac编译是不会把构造器和方法的参数名编译进class中，如果需要获取参数名，可以在方法上加上注解，反射获取注解的值从而获取参数名，比如Jackson的*@JsonCreator*和*@JsonProperty* 。而JDK8新增了这一个功能，可以直接调用*java.lang.reflect.Parameter.getName()*获取到，前提是javac需要添加*-parameters*这个参数。通常来说不建议这样做，因为这会增大.class和在JVM中会占用更多的内存。

# 正文

## 代码

直接上代码。

> 用来打印类信息

```java
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

import static java.lang.System.out;

public class MethodParameterSpy {

    private static final String  fmt = "%24s: %s%n";


    public static void printClassConstructors(Class c) {
        Constructor[] allConstructors = c.getConstructors();
        out.format(fmt, "Number of constructors", allConstructors.length);
        for (Constructor currentConstructor : allConstructors) {
            printConstructor(currentConstructor);
        }
        Constructor[] allDeclConst = c.getDeclaredConstructors();
        out.format(fmt, "Number of declared constructors",
                allDeclConst.length);
        for (Constructor currentDeclConst : allDeclConst) {
            printConstructor(currentDeclConst);
        }
    }

    public static void printClassMethods(Class c) {
        Method[] allMethods = c.getDeclaredMethods();
        out.format(fmt, "Number of methods", allMethods.length);
        for (Method m : allMethods) {
            printMethod(m);
        }
    }

    public static void printConstructor(Constructor c) {
        out.format("%s%n", c.toGenericString());
        Parameter[] params = c.getParameters();
        out.format(fmt, "Number of parameters", params.length);
        for (int i = 0; i < params.length; i++) {
            printParameter(params[i]);
        }
    }

    public static void printMethod(Method m) {
        out.format("%s%n", m.toGenericString());
        out.format(fmt, "Return type", m.getReturnType());
        out.format(fmt, "Generic return type", m.getGenericReturnType());

        Parameter[] params = m.getParameters();
        for (int i = 0; i < params.length; i++) {
            printParameter(params[i]);
        }
    }

    public static void printParameter(Parameter p) {
        out.format(fmt, "Parameter class", p.getType());
        out.format(fmt, "Parameter name", p.getName());
        out.format(fmt, "Modifiers", p.getModifiers());
        out.format(fmt, "Is implicit?", p.isImplicit());
        out.format(fmt, "Is name present?", p.isNamePresent());
        out.format(fmt, "Is synthetic?", p.isSynthetic());
    }

    public static void main(String... args) {

        printClassConstructors(ExampleMethods.class);
        printClassMethods(ExampleMethods.class);
    }
}
```

> 包含各种类型方法的类

```java
import java.util.*;

public class ExampleMethods<T> {

    public boolean simpleMethod(String stringParam, int intParam) {
        System.out.println("String: " + stringParam + ", integer: " + intParam);
        return true;
    }

    public int varArgsMethod(String... manyStrings) {
        return manyStrings.length;
    }

    public boolean methodWithList(List<String> listParam) {
        return listParam.isEmpty();
    }

    public <T> void genericMethod(T[] a, Collection<T> c) {
        System.out.println("Length of array: " + a.length);
        System.out.println("Size of collection: " + c.size());
    }

}
```

## 不带-parameters

不带*-parameters*运行结果：

```java
  Number of constructors: 1
public ExampleMethods()
    Number of parameters: 0
Number of declared constructors: 1

# 构造器
public ExampleMethods()
    Number of parameters: 0
       Number of methods: 4
       
# 方法一
public boolean ExampleMethods.simpleMethod(java.lang.String,int)
             Return type: boolean
     Generic return type: boolean
         Parameter class: class java.lang.String
          Parameter name: arg0
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false
         Parameter class: int
          Parameter name: arg1
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false
           
# 方法二
public boolean ExampleMethods.methodWithList(java.util.List<java.lang.String>)
             Return type: boolean
     Generic return type: boolean
         Parameter class: interface java.util.List
          Parameter name: arg0
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false

# 方法三
public <T> void ExampleMethods.genericMethod(T[],java.util.Collection<T>)
             Return type: void
     Generic return type: void
         Parameter class: class [Ljava.lang.Object;
          Parameter name: arg0
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false
         Parameter class: interface java.util.Collection
          Parameter name: arg1
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false

# 方法四
public int ExampleMethods.varArgsMethod(java.lang.String...)
             Return type: int
     Generic return type: int
         Parameter class: class [Ljava.lang.String;
          Parameter name: arg0
               Modifiers: 0
            Is implicit?: false
        Is name present?: false
           Is synthetic?: false
```

可以看出Parameter name全都是arg0~argN，因为参数名在编译期已经丢失了。Is name present为false。

## 带-parameters

> maven在pom.xml中添加

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>8</source>
                <target>8</target>
                <compilerArgument>-parameters</compilerArgument>
            </configuration>
        </plugin>
    </plugins>
</build>
```

命令行在javc 后面加 -parameters

> 运行结果

```java
  Number of constructors: 1
public ExampleMethods()
    Number of parameters: 0
Number of declared constructors: 1

# 构造器
public ExampleMethods()
    Number of parameters: 0
       Number of methods: 4
           
# 方法一
public boolean ExampleMethods.methodWithList(java.util.List<java.lang.String>)
             Return type: boolean
     Generic return type: boolean
         Parameter class: interface java.util.List
          Parameter name: listParam
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false

# 方法二
public int ExampleMethods.varArgsMethod(java.lang.String...)
             Return type: int
     Generic return type: int
         Parameter class: class [Ljava.lang.String;
          Parameter name: manyStrings
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false

# 方法三
public <T> void ExampleMethods.genericMethod(T[],java.util.Collection<T>)
             Return type: void
     Generic return type: void
         Parameter class: class [Ljava.lang.Object;
          Parameter name: a
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false
         Parameter class: interface java.util.Collection
          Parameter name: c
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false
                                 
# 方法四
public boolean ExampleMethods.simpleMethod(java.lang.String,int)
             Return type: boolean
     Generic return type: boolean
         Parameter class: class java.lang.String
          Parameter name: stringParam
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false
         Parameter class: int
          Parameter name: intParam
               Modifiers: 0
            Is implicit?: false
        Is name present?: true
           Is synthetic?: false
```

这样就把参数名给打印出来了，Is name present为true。

# 代码来源

上述代码全部来自#参考资料中的*Obtaining Names of Method Parameters*

# 参考资料

[Obtaining Names of Method Parameters