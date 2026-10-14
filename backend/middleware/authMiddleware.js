import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authentication token required.',
        });
    }

    const token = authorization.slice(7);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'auth-api',
            audience: 'auth-client',
            algorithms: ['HS256'],
        });

        if (
            typeof payload.sub !== 'string' ||
            !/^[1-9]\d*$/.test(payload.sub)
        ) {
            return res.status(401).json({
                message: 'Invalid authentication token.',
            });
        }

        req.user = { id: payload.sub };

        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired authentication token.',
        });
    }
}

export default authenticateToken;

