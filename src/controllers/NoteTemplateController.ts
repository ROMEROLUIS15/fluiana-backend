import { Request, Response } from 'express';
import { NoteTemplate } from '../models/NoteTemplate';

class NoteTemplateController {
    // Create a new note template
    public static async createNoteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { userId, title, content, reminder } = req.body;

            // Validate input data
            if (!userId || !title || !content) {
                res.status(400).json({
                    ok: false,
                    message: 'User ID, title, and content are required.'
                });
                return;
            }

            // Create the new note template
            const newTemplate = await NoteTemplate.create({ userId, title, content, reminder });
            res.status(201).json({
                ok: true,
                message: 'Note template created successfully.',
                data: newTemplate
            });
        } catch (error: unknown) {
            // Handle errors
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

    // Get all note templates
    public static async getNoteTemplates(req: Request, res: Response): Promise<void> {
        try {
            // Fetch all templates from the database
            const templates = await NoteTemplate.findAll();
            res.status(200).json({
                ok: true,
                data: templates
            });
        } catch (error: unknown) {
            // Handle errors
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

    // Get a specific note template by ID
    public static async getNoteTemplateById(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;

            // Fetch the template by its ID
            const template = await NoteTemplate.findByPk(templateId);

            // Return 404 if the template is not found
            if (!template) {
                res.status(404).json({
                    ok: false,
                    message: 'Note template not found'
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: template
            });
        } catch (error: unknown) {
            // Handle errors
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

    // Update an existing note template
    public static async updateNoteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            const { title, content, reminder, userId } = req.body;
    
            // Verify that the user has permissions to update the template
            const authorizedUserId = req.userId; // Make sure req.user contains the authenticated user's id
            if (authorizedUserId !== userId) {
                res.status(403).json({
                    ok: false,
                    message: 'You are not authorized to update this template'
                });
                return;
            }
    
            // Convert templateId to an integer
            const parsedTemplateId = parseInt(templateId, 10);
    
            // Check if the templateId is valid
            if (isNaN(parsedTemplateId)) {
                res.status(400).json({
                    ok: false,
                    message: 'Invalid templateId'
                });
                return;
            }
    
            // Find the template by ID
            const template = await NoteTemplate.findByPk(parsedTemplateId);
            if (!template) {
                res.status(404).json({
                    ok: false,
                    message: 'Note template not found'
                });
                return;
            }
    
            // Check if the user is the owner of the template
            if (template.userId !== authorizedUserId) {
                res.status(403).json({
                    ok: false,
                    message: 'You are not authorized to update this note template'
                });
                return;
            }
    
            // Update the template
            const [updated] = await NoteTemplate.update(
                { title, content, reminder },
                { where: { templateId: parsedTemplateId } }
            );
    
            // Return 404 if no updates were made
            if (!updated) {
                res.status(404).json({
                    ok: false,
                    message: 'No changes made to the note template'
                });
                return;
            }
    
            // Fetch and return the updated template
            const updatedTemplate = await NoteTemplate.findByPk(parsedTemplateId);
            if (!updatedTemplate) {
                res.status(404).json({
                    ok: false,
                    message: 'Error fetching updated template.'
                });
                return;
            }
    
            res.status(200).json({
                ok: true,
                message: 'Note template updated successfully.',
                data: updatedTemplate
            });
        } catch (error: unknown) {
            // Handle errors
            res.status(500).json({
                ok: false,
                message: (error instanceof Error) ? error.message : 'An unknown error occurred'
            });
        }
    }
    
    // Delete a note template
    public static async deleteNoteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            
            // Delete the template by ID
            const deleted = await NoteTemplate.destroy({ where: { templateId } });

            // Return 204 if deletion is successful
            if (deleted) {
                res.status(204).send(); // 204 No Content
            } else {
                // Return 404 if the template is not found
                res.status(404).json({
                    ok: false,
                    message: 'Note template not found'
                });
            }
        } catch (error: unknown) {
            // Handle errors
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
}

export default NoteTemplateController;
