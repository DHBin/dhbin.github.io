---
date: 2018-10-18 08:15:00
---

# JAVA实例化泛型

一般情况下，是不可以直接实例化泛型的，可以通过反射的机制实例化

# 代码

```java
    /**
     * 获取父类泛型类型
     *
     * @param c     类
     * @param index 父类泛型位置
     * @return Type
     */
    public static Type getSuperclassArgumentsActualType(Class<?> c, int index) {
        Type superClass = c.getGenericSuperclass();
        return ((ParameterizedType) superClass).getActualTypeArguments()[index];
    }

    /**
     * 通过type返回class
     * @param type type
     * @return class
     */
    public static Class<?> getRawType(Type type) {
        if (type instanceof Class) {
            return (Class) type;
        } else if (type instanceof ParameterizedType) {
            ParameterizedType parameterizedType = (ParameterizedType) type;
            Type rawType = parameterizedType.getRawType();
            return (Class) rawType;
        } else if (type instanceof GenericArrayType) {
            Type componentType = ((GenericArrayType) type).getGenericComponentType();
            return Array.newInstance(getRawType(componentType), 0).getClass();
        } else if (type instanceof TypeVariable) {
            return Object.class;
        } else if (type instanceof WildcardType) {
            return getRawType(((WildcardType) type).getUpperBounds()[0]);
        } else {
            String className = type == null ? "null" : type.getClass().getName();
            throw new IllegalArgumentException("Expected a Class, ParameterizedType, or GenericArrayType, but <" + type + "> is of type " + className);
        }
    }

    /**
     * 通过type创建对象
     * @param type type
     * @return 对象实例
     */
    public static Object newInstance(Type type) {
        try {
            return getRawType(type).newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return null;
    }
```