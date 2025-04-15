export class User {
    constructor(
      public name: string,
      public email: string
    ) {
      if (!email.includes('@')) throw new Error('Email inválido');
    }
  }
  