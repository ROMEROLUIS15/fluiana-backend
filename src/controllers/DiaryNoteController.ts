import { Request, Response } from 'express';
import { DiaryNote } from '../models/DiaryNote';
import { User } from '../models/User';
import catchError from '../middlewares/catchError';

class DiaryNoteController {
    // Create a new diary note
    public createDiaryNote = catchError(async(req: Request, res: Response): Promise<void> => {

            const { userId, title, content, date, reminder, sharedWith } = req.body;

            // Validate that the user exists
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({
                    ok: false,
                    message: 'User not found'
                });
                return;
            }

            const newNote = await DiaryNote.create({ userId, title, content, date, reminder, sharedWith });
            res.status(201).json({
                ok: true,
                message: 'Diary note created successfully.',
                data: newNote
            });
    })

    // Get all diary notes
    public getDiaryNotes = catchError(async(req: Request, res: Response): Promise<void> => {

            const notes = await DiaryNote.findAll();
            res.status(200).json({
                ok: true,
                data: notes
            });
    })

    //Get diaries by user's ID 
    public async getDiaryByUser(req: Request, res: Response):Promise<void>{
        const {userId} = req.params

        try {
           const diaries = await DiaryNote.findAll({where : {userId}}) 
           if(diaries.length < 1){
            res.status(404).json({ok:false, message: "No diaries of the user found"})
           }
           res.status(200).json({ok:true, data: diaries}) 
        } catch (error) {
            res.status(500).json({ok: false, message: "Internal server error", error})
        }
    }

    // Get a specific diary note by its ID
    public getDiaryNoteById = catchError(async(req: Request, res: Response): Promise<void> => {

            const { noteId } = req.params;
            const note = await DiaryNote.findByPk(noteId);

            if (!note) {
                res.status(404).json({
                    ok: false,
                    message: 'Diary note not found'
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: note
            });
    })

    // Update an existing diary note
    public updateDiaryNote = catchError(async(req: Request, res: Response): Promise<void> => {

            const noteId = parseInt(req.params.noteId, 10); // Ensure it is an integer
            const { title, content, date, reminder, sharedWith } = req.body;
    
            // Check if the note exists before updating it
            const note = await DiaryNote.findByPk(noteId);
            if (!note) {
                res.status(404).json({
                    ok: false,
                    message: 'Diary note not found'
                });
                return;
            }
    
            // Update the note
            await note.update({ title, content, date, reminder, sharedWith });
    
            res.status(200).json({
                ok: true,
                message: 'Diary note updated successfully.',
                data: note  // Return the updated note
            });
    })
    
    // Delete a diary note
    public deleteDiaryNote = catchError(async(req: Request, res: Response): Promise<void> => {

            const { noteId } = req.params;
            const deleted = await DiaryNote.destroy({ where: { noteId } });

            if (deleted) {
                res.status(204).send(); // 204 No Content
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Diary note not found'
                });
            }
    })
}

export default new DiaryNoteController();