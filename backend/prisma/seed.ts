import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 1. 创建角色（如果不存在）
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: 'EMPLOYEE' },
      update: {},
      create: {
        code: 'EMPLOYEE',
        name: '普通员工',
      },
    }),
    prisma.role.upsert({
      where: { code: 'MANAGER' },
      update: {},
      create: {
        code: 'MANAGER',
        name: '主管/审批人',
      },
    }),
    prisma.role.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        code: 'HR',
        name: '人力资源',
      },
    }),
    prisma.role.upsert({
      where: { code: 'ADMIN' },
      update: {},
      create: {
        code: 'ADMIN',
        name: '系统管理员',
      },
    }),
  ]);

  console.log('角色创建完成:', roles.map(r => r.name));

  // 2. 创建测试组织
  const org = await prisma.org.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '测试公司',
    },
  });

  console.log('组织创建完成:', org.name);

  // 3. 创建部门
  const techDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      orgId: org.id,
      name: '技术部',
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      orgId: org.id,
      name: '人事部',
    },
  });

  console.log('部门创建完成');

  // 4. 创建测试用户
  const passwordHash = await bcrypt.hash('123456', 10);

  // 管理员
  const admin = await prisma.user.upsert({
    where: {
      orgId_email: {
        orgId: org.id,
        email: 'admin@test.com',
      },
    },
    update: {},
    create: {
      orgId: org.id,
      departmentId: hrDept.id,
      email: 'admin@test.com',
      passwordHash,
      employeeNo: 'EMP001',
      fullName: '系统管理员',
      status: 'ACTIVE',
    },
  });

  // 主管
  const manager = await prisma.user.upsert({
    where: {
      orgId_email: {
        orgId: org.id,
        email: 'manager@test.com',
      },
    },
    update: {},
    create: {
      orgId: org.id,
      departmentId: techDept.id,
      email: 'manager@test.com',
      passwordHash,
      employeeNo: 'EMP002',
      fullName: '张主管',
      status: 'ACTIVE',
    },
  });

  // 普通员工
  const employee = await prisma.user.upsert({
    where: {
      orgId_email: {
        orgId: org.id,
        email: 'employee@test.com',
      },
    },
    update: {},
    create: {
      orgId: org.id,
      departmentId: techDept.id,
      email: 'employee@test.com',
      passwordHash,
      employeeNo: 'EMP003',
      fullName: '李员工',
      status: 'ACTIVE',
    },
  });

  console.log('用户创建完成');

  // 5. 分配角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: roles.find(r => r.code === 'ADMIN')!.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: roles.find(r => r.code === 'ADMIN')!.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: manager.id,
        roleId: roles.find(r => r.code === 'MANAGER')!.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      roleId: roles.find(r => r.code === 'MANAGER')!.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: employee.id,
        roleId: roles.find(r => r.code === 'EMPLOYEE')!.id,
      },
    },
    update: {},
    create: {
      userId: employee.id,
      roleId: roles.find(r => r.code === 'EMPLOYEE')!.id,
    },
  });

  // 6. 建立主管-员工关系
  await prisma.userManager.upsert({
    where: { employeeId: employee.id },
    update: {},
    create: {
      orgId: org.id,
      employeeId: employee.id,
      managerId: manager.id,
    },
  });

  console.log('角色和关系分配完成');

  // 7. 创建工作班次
  const schedule = await prisma.workSchedule.create({
    data: {
      orgId: org.id,
      name: '标准班次',
      startTime: new Date('1970-01-01T09:00:00'),
      endTime: new Date('1970-01-01T18:00:00'),
      breakStart: new Date('1970-01-01T12:00:00'),
      breakEnd: new Date('1970-01-01T13:00:00'),
      lateGraceMinutes: 5,
      earlyLeaveGraceMinutes: 5,
      minWorkMinutes: 480, // 8小时
    },
  });

  console.log('工作班次创建完成:', schedule.name);

  // 8. 创建地理围栏
  const geoFence = await prisma.geoFence.create({
    data: {
      orgId: org.id,
      name: '总部办公楼',
      address: '北京市朝阳区测试路1号',
      lat: 39.9042,
      lng: 116.4074,
      radiusM: 200,
      isActive: true,
    },
  });

  console.log('地理围栏创建完成:', geoFence.name);

  console.log('\n✅ 数据初始化完成！');
  console.log('\n测试账号：');
  console.log('管理员: admin@test.com / 123456');
  console.log('主管: manager@test.com / 123456');
  console.log('员工: employee@test.com / 123456');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



