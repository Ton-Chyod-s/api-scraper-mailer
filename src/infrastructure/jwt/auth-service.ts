import jwt, { JwtPayload } from 'jsonwebtoken';

export class AuthService {
    private secretKey = process.env.JWT_SECRET_KEY || 'S&cr3tK3y';

    generateToken(userId: string, role: string): string {
        const payload = { sub: userId, role: role };
        return jwt.sign(payload, this.secretKey, {
            expiresIn: '6h'
        });
    }
    
    verifyToken(token: string): string | JwtPayload {
        return jwt.verify(token, this.secretKey);
    }
    
    getRoleFromToken(token: string): string {
        const decoded = this.verifyToken(token) as JwtPayload;
        if (!decoded.role) {
            throw new Error('Token não contém role');
        }
        return decoded.role;
    }
}