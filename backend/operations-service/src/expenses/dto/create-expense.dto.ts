import { ExpenseType } from '../../entities/expense.entity';

export class CreateExpenseDto {
  tripId: string;
  type: ExpenseType;
  amount: number;
  concept: string;
}
