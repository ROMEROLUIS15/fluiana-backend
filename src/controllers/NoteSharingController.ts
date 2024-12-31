import { Request, Response } from 'express';
import NoteSharing from '../models/NoteSharing';
import DiaryNote from '../models/DiaryNote';
import { Therapist, User } from '../models';
import sequelize from '../config/database';

class NoteSharingController {

    public static async shareNote(req: Request, res: Response): Promise<void> {
        const t = await sequelize.transaction();

        try {
            const { noteId, sharedWithUserId, sharedWithTherapistId } = req.body;

            if (!sharedWithUserId && !sharedWithTherapistId) {
                res.status(400).json({
                    ok: false,
                    message: 'Must share with at least a user or a therapist.'
                });
                return;
            }

            const note = await DiaryNote.findByPk(noteId);
            if (!note) {
                await t.rollback();
                res.status(404).json({
                    ok: false,
                    message: 'Diary note not found.'
                });
                return;
            }

            let sharedWithUser = null;
            if (sharedWithUserId) {
                sharedWithUser = await User.findByPk(sharedWithUserId);
                if (!sharedWithUser) {
                    await t.rollback();
                    res.status(400).json({
                        ok: false,
                        message: 'User not found.'
                    });
                    return;
                }
            }

            let sharedWithTherapist = null;
            if (sharedWithTherapistId) {
                sharedWithTherapist = await User.findOne({
                    where: { userId: sharedWithTherapistId, role: 'therapist' }
                });
                if (!sharedWithTherapist) {
                    await t.rollback();
                    res.status(400).json({
                        ok: false,
                        message: 'Therapist not found or user is not a therapist.'
                    });
                    return;
                }
            }

            const noteSharing = await NoteSharing.create({
                noteId,
                sharedWithUserId: sharedWithUser ? sharedWithUser.userId : null,
                sharedWithTherapistId: sharedWithTherapist ? sharedWithTherapist.userId : null,
            }, { transaction: t });

            await t.commit();

            res.status(201).json({
                ok: true,
                message: 'Note shared successfully.',
                data: noteSharing
            });
        } catch (error: unknown) {
            await t.rollback();
            if (error instanceof Error) {
                res.status(500).json({
                    ok: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    ok: false,
                    message: 'An unknown error occurred'
                });
            }
        }
    }

    // Obtener notas compartidas con un usuario o terapeuta
    public static async getSharedNotes(req: Request, res: Response): Promise<void> {
        try {
            const { userId, therapistId } = req.params;

            // Verificar si estamos buscando por usuario o terapeuta
            if (!userId && !therapistId) {
                res.status(400).json({
                    ok: false,
                    message: 'Must provide a userId or therapistId.'
                });
                return;
            }

            // Encontrar las notas compartidas
            const sharedNotes = await NoteSharing.findAll({
                where: userId ? { sharedWithUserId: userId } : { sharedWithTherapistId: therapistId },
                include: [{ model: DiaryNote, as: 'diaryNote' }]
            });

            res.status(200).json({
                ok: true,
                data: sharedNotes
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({
                    ok: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    ok: false,
                    message: 'An unknown error occurred'
                });
            }
        }
    }

    // Actualizar la compartición de una nota
    public static async updateNoteSharing(req: Request, res: Response): Promise<void> {
        try {
            const { shareId } = req.params;
            const { sharedWithUserId, sharedWithTherapistId } = req.body;

            // Verificar que se proporcione al menos un usuario o terapeuta
            if (!sharedWithUserId && !sharedWithTherapistId) {
                res.status(400).json({
                    ok: false,
                    message: 'Must update to share with at least a user or a therapist.'
                });
                return;
            }

            // Encontrar la entrada en NoteSharing
            const noteSharing = await NoteSharing.findByPk(shareId);
            if (!noteSharing) {
                res.status(404).json({
                    ok: false,
                    message: 'Note sharing record not found.'
                });
                return;
            }

            // Actualizar la compartición
            await noteSharing.update({
                sharedWithUserId: sharedWithUserId || null,
                sharedWithTherapistId: sharedWithTherapistId || null
            });

            res.status(200).json({
                ok: true,
                message: 'Note sharing updated successfully.',
                data: noteSharing
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({
                    ok: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    ok: false,
                    message: 'An unknown error occurred'
                });
            }
        }
    }

    // Eliminar la compartición de una nota
    // public static async unshareNote(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { shareId } = req.params;

    //         // Verificar si existe la compartición
    //         const noteSharing = await NoteSharing.findByPk(shareId);
    //         if (!noteSharing) {
    //             res.status(404).json({
    //                 ok: false,
    //                 message: 'Note sharing record not found.'
    //             });
    //             return;
    //         }

    //         // Eliminar la compartición
    //         await noteSharing.destroy();

    //         res.status(200).json({
    //             ok: true,
    //             message: 'Note unshared successfully.'
    //         });
    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             res.status(500).json({
    //                 ok: false,
    //                 message: error.message
    //             });
    //         } else {
    //             res.status(500).json({
    //                 ok: false,
    //                 message: 'An unknown error occurred'
    //             });
    //         }
    //     }
    // }
}

export default NoteSharingController;