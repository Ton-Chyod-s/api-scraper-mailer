import jwt, { JwtPayload } from 'jsonwebtoken';

export class AuthService {
    private secretKey = process.env.JWT_SECRET_KEY || 'S&cr3tK3y';

    generateToken(userId: string): string {
        const payload = { sub: userId };
        return jwt.sign(payload, this.secretKey, {
            expiresIn: '6h'
        });
    }
    
    verifyToken(token: string): string | JwtPayload {
        return jwt.verify(token, this.secretKey);
    }
}