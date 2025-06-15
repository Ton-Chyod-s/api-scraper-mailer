export class User {
    constructor(
      public name: string,
      public email: string,
      public authUserId: number,
    ) {
      if (!email.includes('@')) throw new Error('Email inválido');
    }
  }
  
