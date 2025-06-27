export class User {
    constructor(
      public name: string,
      public email: string,
      public authUserId?: number,
      public id?: number,
    ) {
      if (!email.includes('@')) throw new Error('Email inválido');
    }
  }
  
