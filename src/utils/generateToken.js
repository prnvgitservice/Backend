import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};



export const requireSignIn = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(400).json({ message: "Authorization header required" });
    }
};

export const userMiddleware = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "User access denied" });
    }
    next();
};

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access denied" });
    }
    next();
};
export const technicianMiddleware = (req, res, next) => {
    if (req.user.role !== "technician") {
        return res.status(403).json({ message: "Techician access denied" });
    }
    next();
};
export const franchaiseMiddleware = (req, res, next) => {
    if (req.user.role !== "franchise") {
        return res.status(403).json({ message: "Franchise access denied" });
    }
    next();
};
export const executiveMiddleware = (req, res, next) => {
    if (req.user.role !== "executive") {
        return res.status(403).json({ message: "Executive access denied" });
    }
    next();
};
