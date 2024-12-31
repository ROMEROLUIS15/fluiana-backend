import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { DiaryNote } from './DiaryNote';
import { User } from './User';
import { Therapist } from './Therapist';

export class NoteSharing extends Model {
    public shareId!: number;
    public noteId!: number;
    public sharedWithUserId?: number;
    public sharedWithTherapistId?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

NoteSharing.init({
    shareId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DiaryNote,
            key: 'noteId',
        },
        // onDelete: 'CASCADE', // Elimina los registros relacionados si se elimina una nota
    },
    sharedWithUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'userId',
        },
        // validate: {
        //     isInt: true,
        // },
    },
    sharedWithTherapistId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'userId',
        },
        // validate: {
        //     isInt: true,
        // },
    },
}, {
    sequelize,
    modelName: 'NoteSharing',
    tableName: 'note_sharing',
    // validate: {
    //     // Asegúrate de que al menos uno de los campos de compartición no sea nulo
    //     sharedWith: function() {
    //         if (!this.sharedWithUserId && !this.sharedWithTherapistId) {
    //             throw new Error('At least one of sharedWithUserId or sharedWithTherapistId must be provided');
    //         }
    //     }
    // }
});

export default NoteSharing;
