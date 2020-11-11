import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const findedCategory = await getCategory(category);

    const balance = await transactionRepository.getBalance();

    if (balance.total < value && type === 'outcome') {
      throw new AppError("You don't have enough funds", 400);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: findedCategory.id,
    });

    const transactionSaved = transactionRepository.save(transaction);

    return transactionSaved;
  }
}

async function getCategory(category: string): Promise<Category> {

  const categoryRepository = getRepository(Category);

  const findCategory = await categoryRepository.findOne({
    where: {
      title: category,
    }
  });

  if (findCategory) {
    return findCategory;
  }

  const categoryCreated = categoryRepository.create({
    title: category,
  });

  const categorySaved = await categoryRepository.save(categoryCreated);

  return categorySaved;
}

export default CreateTransactionService;
