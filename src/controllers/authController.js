import userRepository from "../repositories/userRepository.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const authController = {
    create: async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Preencha todos os campos'
            });
        };

        const userExist = await userRepository.getByEmail(email);

        if (userExist) return res.status(400).json({
            ok: false,
            status: 400,
            message: 'Email já cadastrado'
        });

        if (password.length < 6) return res.status(400).json({
            ok: false,
            status: 400,
            message: 'A senha tem que conter no mínimo 6 caracteres'
        });

        try {
            const salt = await bcrypt.genSalt(12);
            const hashPassword = await bcrypt.hash(password, salt);

            const newUser = await userRepository.create({
                name, email, password: hashPassword
            })

            if (newUser) return res.status(201).json({
                ok: true,
                status: 201,
                message: 'Usuario cadastrado com sucesso'
            });

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao cadastrar usuario'
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    login: async (req, res) => {    
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Preencha todos os campos'
            });
        };

        try {
            const user = await userRepository.getByEmail(email);

            if (!user) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Usuario não encontrado'
            });

            const checkPassword = await bcrypt.compare(password, user.password);

            if (!checkPassword) return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Senha inválida'
            });

            const token = jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                process.env.SECRET,
                { expiresIn: '14d' }
            );

            res.status(200).json({
                ok: true,
                status: 200,
                token: token,
                id: user.id
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getAllUser: async (req, res) => {
        try {
            const users = await userRepository.getAll();

            if (users) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuarios encontrados com sucesso',
                users: users
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar usuarios',
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getUserById: async (req, res) => {
        const id = req.user.id;

        try {
            const user = await userRepository.getById(+id);

            if (user) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuario encontrados com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar usuario',
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    updateUser: async (req, res) => {
        const id = req.user.id;
        const { email, name, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Preencha todos com campos'
            });
        }

        try {
            const userUpdate = await userRepository.update(+id, { email, name, password });

            if (userUpdate) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuario atualizado com sucesso',
                user: userUpdate
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar usuario',
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    updatePassword: async (req, res) => {
        //
    },
    deleteUser: async (req, res) => {
        const id = req.params.id;

        try{
            const user = userRepository.getById(id);

            if(user){
                await userRepository.delete(id);
                return res.status(200).json({
                    ok:true,
                    status: 200,
                    message: 'Usuario deletado com sucesso'
                });
            }

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar usuario',
            });
        } catch(error){
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    }
}

export default authController