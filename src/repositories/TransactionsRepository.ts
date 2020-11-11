import { EntityRepository, getCustomRepository, Repository } from 'typeorm';
import CategoriesRepository from './CategoriesRepository';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getTransactions(): Promise<Transaction[]> {

    const transactions = await this.find();

    const categoryRepository = getCustomRepository(CategoriesRepository);

    transactions.map(async (transaction) => {
      const category = await categoryRepository.findOneOrFail({
        where: {
          id: transaction.category_id
        }
      });

      transaction.category = category;

      return transaction;
    });

    return transactions;

  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += transaction.value;
            break;
          case 'outcome':
            accumulator.outcome += transaction.value;
            break;
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0
      }
    );
    const total = income - outcome;
    const balance = {
      income,
      outcome,
      total,
    };
    return balance;
  }
}

export default TransactionsRepository;
