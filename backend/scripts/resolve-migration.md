# 解决迁移错误的方法

## 方案一：如果数据库已经存在（推荐）

如果您的数据库表已经创建好了，可以直接标记迁移为已应用：

```bash
# 1. 标记迁移为已应用（跳过执行）
npx prisma migrate resolve --applied 20260107204119_
```

## 方案二：重置迁移并重新应用

如果数据库表还没有创建，需要重置迁移状态：

```bash
# 1. 删除迁移记录（保留数据库）
npx prisma migrate resolve --rolled-back 20260107204119_

# 2. 重新应用迁移
npm run prisma:migrate
```

## 方案三：使用 db push（开发环境推荐）

对于本地开发环境，可以直接使用 `db push` 同步 schema，无需迁移：

```bash
npx prisma db push
```

这会将 schema.prisma 中的定义直接同步到数据库，不需要迁移文件。


