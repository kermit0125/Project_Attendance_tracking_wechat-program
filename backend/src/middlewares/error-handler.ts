import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { prisma } from '../config/prisma';

/**
 * 统一错误返回格式
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

/**
 * 自定义业务错误
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 错误处理中间件
 */
export async function errorHandler(
  error: FastifyError | AppError | ZodError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Zod 验证错误
  if (error instanceof ZodError) {
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: '参数校验失败',
      details: error.errors,
    } as ErrorResponse);
  }

  // 自定义业务错误
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
      details: error.details,
    } as ErrorResponse);
  }

  // Prisma 错误
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // 唯一约束冲突
    if (prismaError.code === 'P2002') {
      return reply.status(409).send({
        code: 'DUPLICATE_ENTRY',
        message: '数据已存在',
        details: prismaError.meta,
      } as ErrorResponse);
    }

    // 记录不存在
    if (prismaError.code === 'P2025') {
      return reply.status(404).send({
        code: 'NOT_FOUND',
        message: '资源不存在',
      } as ErrorResponse);
    }
  }

  // JWT 错误
  if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
    return reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: '未授权，请先登录',
    } as ErrorResponse);
  }

  // 默认错误
  request.log.error(error);
  
  const statusCode = (error as FastifyError).statusCode || 500;
  return reply.status(statusCode).send({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  } as ErrorResponse);
}



