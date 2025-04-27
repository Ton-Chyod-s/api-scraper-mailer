-- CreateTable
CREATE TABLE "task_log" (
    "id" SERIAL NOT NULL,
    "task_name" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_log_pkey" PRIMARY KEY ("id")
);
