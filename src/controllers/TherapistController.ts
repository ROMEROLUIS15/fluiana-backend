import { Request, Response } from 'express';
import { Therapist, Speciality, User, Schedule, Document, } from '../models';
import { TherapistRoute } from '../interfaces';
import bcryptjs from 'bcryptjs';
import { getFilePath, unlinkFile } from '../utils/auth';
import { ContactInformation } from '../models/ContactInformation';
import { Op } from 'sequelize';
import catchError from '../middlewares/catchError';
import Sender from '../models/Sender';

interface TherapistSearchQuery {
    userId?: number;
    ageAbove?: string; // strings porque vienen como query params
    ageBelow?: string;
    gender?: string;
    // religion?: string;
    specialties?: string;
}

class TherapistController {

    // Creates a new therapist user with their professional information and documents
    public createUserTherapist = catchError(async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const {
            username,
            email,
            password,
            gender,
            birthday,
            location,
            phone,
            registration,
            specialities,
            schedules,
        }: TherapistRoute = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        // Compruebo existendia de minimo 1 archivo de cada tipo

        if (!files["certificates"] || !files["document"]) {
            res.status(404).json({
                ok: false,
                message: "Files not found",
            });
            return;
        }
        // Compruebo la existencia del usuario en DB
        //await sequelize.sync();
        const userExist = await User.findOne({
            where: { email: email },
        });
        if (userExist) {
            res.status(400).json({
                ok: false,
                message: "User exist",
            });
            return;
        }
        try {
            // Crea el usuario en la DB
            const user = await User.create({
                username,
                email,
                password,
                gender,
                birthday,
                location,
                phone,
                role: "therapist",
                userImage: null,
            });
            // Creo el terapeuta
            const therapist = await Therapist.create({
                userId: user.userId,
                registrationNum: registration,
                aboutme: null,
                phrase: null
            });
            // Creo en la tabla de especialidades todas las que tenga el usuario
            specialities.forEach(async (speciality) => {
                const [spec, created] = await Speciality.findOrCreate({
                    where: { speciality: speciality },
                    defaults: { speciality: speciality }
                })
                if (created) {
                    await therapist.addSpeciality(spec);
                } else {
                    await therapist.addSpeciality(spec);
                }
                // await Speciality.create({
                //     therapistId: therapist.therapistId,
                //     speciality,
                // });
            });
            // Creo en la tabla de cronogramas los distintos horarios del usuario
            // Temporal hasta saber el tipo de data que ingrsa
            schedules.forEach(async (schedule) => {
                const temp = schedule.split("-");
                await Schedule.create({
                    therapistId: therapist.therapistId,
                    weekDay: temp[0],
                    startHour: temp[1],
                    endHour: temp[2],
                });
            });

            // Crep la informacion del documento legal del terapeuta, que hasta el momento es 1 solo
            await Document.create({
                therapistId: therapist.therapistId,
                typeDocument: "document",
                name: files["document"][0].originalname,
                formatDocument: files["document"][0].filename.split(".")[1],
            });
            // Creo la informacion de los certificados del terapeuta, que hasta el momento son 2
            files["certificates"].forEach(async (file) => {
                await Document.create({
                    therapistId: therapist.therapistId,
                    typeDocument: "certificate",
                    name: file.originalname,
                    formatDocument: file.filename.split(".")[1],
                });
            });
            console.log({ therapist })

            res.status(200).json({
                ok: true,
                message: "User therapist created succesfully",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    })

    // Gets a list of all therapists with their related information
    public getAllTherapists = catchError(async (_req: Request, res: Response): Promise<void> => {

        const therapists = await Therapist.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username', 'email', 'gender', 'birthday', 'location', 'phone', 'userImage'],
                },
                {
                    model: Speciality,
                    attributes: ['speciality'],
                },
                {
                    model: Schedule,
                    attributes: ['weekDay', 'startHour', 'endHour'],
                },
                {
                    model: Document,
                    attributes: ['typeDocument', 'name', 'formatDocument'],
                },
            ],
        })
        if (!therapists) {
            res.status(404).json({
                ok: false,
                message: 'There are no therapists',
            });
            return;
        }
        res.status(200).json({
            ok: true,
            therapists,
        });
    }
    )

    public async getTherapistById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        console.log("Params: ", id)
        try {
            // Buscar terapeuta y asociar datos relacionados
            const therapist = await Therapist.findOne({
                where: { userId: id },
                include: [
                    {
                        model: User,
                        attributes: ['username', 'email', 'gender', 'birthday', 'location', 'phone'],
                    },
                    {
                        model: Speciality,
                        attributes: ['specialityId', 'speciality'],
                    },
                    {
                        model: Schedule,
                        attributes: ['scheduleId', 'weekDay', 'startHour', 'endHour'],
                    },
                    {
                        model: Document,
                        attributes: ['typeDocument', 'name', 'formatDocument'],
                    },
                    {
                        model: ContactInformation,
                        as: 'contactInformations',
                        attributes: ['contactInfoId', 'description'],
                    }
                ],
            });

            if (!therapist) {
                res.status(404).json({
                    ok: false,
                    message: 'Therapist not found in getbyId',
                });
                return;
            }

            res.status(200).json({
                ok: true,
                therapist,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                ok: false,
                message: 'Internal server error',
            });
        }
    }

    public async findTherapistByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;  // assuming email is sent in the body (for POST method)

            console.log("Email in body: ", email);

            // Fetch the therapist with the related User, Speciality, and Schedule all in one query
            const therapist = await Therapist.findOne({
                include: [
                    {
                        model: User,
                        where: { email: email },  // Find based on the user's email
                        attributes: { exclude: ['password'] },
                    },
                    {
                        model: Speciality,
                        attributes: ["speciality"],  // Include the speciality related to the therapist
                    },
                    {
                        model: Schedule,
                        attributes: ['scheduleId', 'weekDay', 'startHour', 'endHour'],  // Include the therapist's schedule
                    },
                    {
                        model: Sender,
                        as: 'sender',
                        attributes: ['id'],
                    },
                ],
            });

            if (therapist) {
                res.json(therapist);  // Send the therapist data if found
                console.log(therapist)
            } else {
                res.status(404).json({ message: 'Therapist not found' });  // Handle case when no therapist is found
            }
        } catch (error) {
            console.error("Error:", error);  // Log the error for debugging purposes
            res.status(500).json({ message: 'Server error', error });  // Return server error
        }
    }



    // public async updateTherapistProfile(req: Request, res: Response): Promise<void> {

    //     req.body.userImage = '';
    //     const files: any = req.files as {
    //         [fieldname: string]: Express.Multer.File[];
    //     };

    //     if (files.userImage) {
    //         req.body.userImage = getFilePath(files.userImage);
    //     }

    //     const { userId, username, email, password, therapistId, registrationNum, aboutme, phrase, specialities, schedules, contactInformations } = req.body;

    //     try {
    //         // Traemos los datos del usuario por el ID
    //         const user = await User.findOne({ where: {userId: userId} });

    //         if(req.body.userImage !== ''){
    //             // si existe la ruta de la imagen del usuario en la tabla lo eliminamos
    //             if (user?.userImage) unlinkFile(user?.userImage);
    //         }else {
    //             // Si no hay imagen, no la eliminamos
    //             req.body.userImage = user?.userImage;
    //         }

    //         const userImage = req.body.userImage;

    //         // Comparamos si hubo cambios en el email del usuario
    //         if (user?.email !== email){
    //             // Verificamos si el nuevo email ya está en uso
    //             const emailExists = await User.findOne({ where: { email: email } });
    //             // si existe, finalizamos la transaccion y retornamos el mensaje de error
    //             if (emailExists) {
    //                 res.status(400).json({ ok: false, message: 'El email ya está en uso' });
    //                 return;
    //             }
    //         }

    //         let newPassword: string | undefined;

    //         if ( password !== undefined || (typeof password==='string' && password.trim().length !== 0)) {
    //             const hashedPassword = await bcryptjs.hash(password, 10);
    //             newPassword = hashedPassword;
    //         }else {
    //             newPassword = user?.password;
    //         }

    //         // Actualizar los datos del usuario
    //         await User.update({ username: username, email: email, password: newPassword, userImage: userImage }, { where: { userId: userId } });

    //         const therapist = await Therapist.findOne({ where: {therapistId: therapistId} });
    //         if (!therapist) {
    //             res.status(404).json({ message: "Therapist not found" });
    //             return;
    //         }

    //         //Actualizar los datos del therapist
    //         await Therapist.update({ registrationNum:registrationNum, aboutme: aboutme, phrase: phrase }, { where: { therapistId: therapistId } });

    //         // Creo en la tabla de especialidades todas las que tenga el usuario
    //         specialities.forEach(async (speciality: any) => {

    //             if(Number(speciality.specialityId) !== 0){
    //                 await Speciality.update({speciality: speciality.speciality}, {where: {specialityId: speciality.specialityId}})
    //             } else {
    //                 await Speciality.create({
    //                     therapistId: therapist.therapistId,
    //                     speciality,
    //                 });
    //             }
    //         });
    //         // Creo en la tabla de cronogramas los distintos horarios del usuario
    //         // Temporal hasta saber el tipo de data que ingrsa
    //         schedules.forEach(async (schedule: any) => {
    //             //const temp = schedule.content.split("-");
    //             if(Number(schedule.scheduleId) !== 0){
    //                 await Schedule.update({ weekDay: schedule.weekDay, startHour: schedule.startHour, endHour: schedule.endHour }, { where: { scheduleId: schedule.scheduleId} });
    //             }else {
    //                 await Schedule.create({
    //                     therapistId: therapist.therapistId,
    //                     weekDay: schedule.weekDay,
    //                     startHour: schedule.startHour,
    //                     endHour: schedule.endHou,
    //                 });
    //             }
    //         });

    //         // Actualizamos o insertamos datos a la tabla medios de contactos
    //         contactInformations.forEach(async (contacts: any) => {
    //             console.log(contacts);
    //             console.log(typeof contacts.contactInfoId)
    //             if(Number(contacts.contactInfoId) !== 0){
    //                 await ContactInformation.update({ description: contacts.description }, { where: { contactInfoId: contacts.contactInfoId } });
    //             } else {
    //                 await ContactInformation.create({
    //                     therapistId: therapist.therapistId,
    //                     description: contacts.description,
    //                 });
    //             }
    //         })

    //         res.status(200).json({ ok: true, message: "Profile updated successfully" });
    //     } catch (error) {
    //         if (req.body.userImage) unlinkFile(req.body.userImage);
    //         res.status(500).json({ ok: false, message: "Internal server error" });
    //     }
    // }
    public async updateTherapistProfile(req: Request, res: Response): Promise<void> {
        const { userId, username, email, password, therapistId, registrationNum, aboutme, phrase, specialities, schedules, contactInformations } = req.body;
        console.log("Req.file: ", req.file)
        const userImage = req.file ? getFilePath(req.file) : null;
        console.log("Body: ", req.body)
        console.log("Uploaded file: ", userImage)

        try {


            // Fetch user by ID
            const user = await User.findOne({ where: { userId } });
            if (!user) {
                res.status(404).json({ ok: false, message: 'User not found' });
                return;
            }

            if (userImage) {
                if (user?.userImage) unlinkFile(user.userImage)
            } else {
                req.body.userImage = user?.userImage
            }

            // const userImage = req.body.userImage;

            // Check for email change and existing email in use
            if (user.email !== email) {
                const emailExists = await User.findOne({ where: { email } });
                if (emailExists) {
                    res.status(400).json({ ok: false, message: 'Email is already in use' });
                    return;
                }
            }

            let newPassword: string | undefined;

            if (password !== undefined || (typeof password === 'string' && password.trim().length !== 0)) {
                const hashedPassword = await bcryptjs.hash(password, 10);
                newPassword = hashedPassword;
            } else {
                newPassword = user?.password;
            }

            // Actualizar los datos del usuario
            await User.update({ username: username, email: email, password: newPassword, userImage: userImage }, { where: { userId: userId } });

            const therapist = await Therapist.findOne({ where: { therapistId: therapistId } });
            if (!therapist) {
                res.status(404).json({ message: "Therapist not found" });
                return;
            }

            //Actualizar los datos del therapist
            await Therapist.update({ registrationNum: registrationNum, aboutme: aboutme, phrase: phrase }, { where: { therapistId: therapistId } });

            // Update specialties
            const parsedSpecialities = JSON.parse(specialities)
            console.log("Parsed specialities", parsedSpecialities)

            for (const speciality of parsedSpecialities) {
                // Check if the speciality already exists in the database
                const existingSpeciality = await Speciality.findOne({ where: { speciality } });

                if (existingSpeciality) {
                    // If the speciality exists, update it (if necessary)
                    console.log(`Speciality "${speciality}" already exists. Skipping creation.`);
                } else {
                    // If the speciality does not exist, create it
                    await Speciality.create({
                        therapistId: therapist.therapistId,
                        speciality
                    });
                    console.log(`Speciality "${speciality}" created.`);
                }
            }


            // Update schedules
            for (const schedule of schedules) {
                if (Number(schedule.scheduleId) !== 0) {
                    await Schedule.update({ weekDay: schedule.weekDay, startHour: schedule.startHour, endHour: schedule.endHour }, { where: { scheduleId: schedule.scheduleId } });
                } else {
                    await Schedule.create({ therapistId: therapist.therapistId, weekDay: schedule.weekDay, startHour: schedule.startHour, endHour: schedule.endHour });
                }
            }

            res.status(200).json({ ok: true, message: "Profile updated successfully" });
        } catch (error) {
            console.log("error: ", error)
            if (req.body.userImage) unlinkFile(req.body.userImage);
            res.status(500).json({ ok: false, message: "Internal server error", error });
        }
    }


    // Updates the specialties of a specific therapist
    public updateSpecialities = catchError(async (req: Request, res: Response): Promise<void> => {
        const userId = req.userId;
        const { specialities } = req.body;

        try {
            const therapist = await Therapist.findOne({ where: { userId } });

            if (!therapist) {
                res.status(404).json({ message: "Therapist not found" });
                return;
            }

            await Speciality.destroy({ where: { therapistId: therapist.therapistId } });

            specialities.forEach(async (speciality: string) => {
                await Speciality.create({ therapistId: therapist.therapistId, speciality });
            });

            res.status(200).json({ message: "Specialities updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    })

    // Updates a user's assigned therapist to a new one
    public changeTherapist = catchError(async (req: Request<{}, {}, {}, TherapistSearchQuery>, res: Response) => {
        try {
            const {
                userId,
                ageAbove, // edad mayor a
                ageBelow, //edad menor a
                gender,
                //   religion,
                specialties,
            } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            // Buscar al usuario por su ID
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Construir condiciones de búsqueda
            const whereConditions: any = {};

            // Filtrar por edad
            if (ageAbove) whereConditions['birthday'] = { [Op.lte]: new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(ageAbove))) };
            if (ageBelow) whereConditions['birthday'] = { [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(ageBelow))) };

            // Filtrar por género
            if (gender) whereConditions['gender'] = gender;

            // Buscar terapeutas con las condiciones especificadas
            const therapists = await Therapist.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['username', 'email'],
                        where: whereConditions,
                    },
                    {
                        model: Speciality,
                        where: specialties
                            ? { speciality: { [Op.in]: specialties.split(',') } }
                            : {},
                        required: specialties ? true : false,
                    },
                ],
            });

            // Verificar si se encontraron terapeutas
            if (therapists.length === 0) {
                return res.status(404).json({ message: 'No se ha encontrado un terapeuta con esas características' });
            }

            // Filtrar para excluir al terapeuta ya asignado si existe
            const availableTherapists = therapists.filter(therapist => therapist.therapistId !== user.assignedTherapeutId);

            // Si hay terapeutas disponibles que no sean el asignado, elegir uno al azar
            if (availableTherapists.length > 0) {
                const randomTherapist = availableTherapists[Math.floor(Math.random() * availableTherapists.length)];
                user.assignedTherapeutId = randomTherapist.therapistId;
                await user.save();
                return res.status(200).json({ message: 'Nuevo terapeuta asignado', therapist: randomTherapist });
            } else {
                // Si no hay terapeutas disponibles diferentes al asignado
                return res.status(200).json({ message: 'El único terapeuta disponible es el que ya está asignado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching therapists' });
        }
    })

    public getUsersByTherapist = async (req: Request, res: Response): Promise<void> => {
        const { therapistId } = req.params;

        try {
            const patients = await User.findAll({
                where: { assignedTherapeutId: therapistId },
                attributes: ["userId", "username", "email"]
            })

            if (patients.length == 0) {
                res.status(404).json({ message: "No users under this patient" })
            }
            res.status(200).json({ ok: true, data: patients || [] })
        } catch (error) {

            res.status(500).json({ ok: false, message: "Internal server error", error })
        }
    }
}

export default new TherapistController();