import fs from 'fs';

export const getFilePath = (file: any) => {
    const path = file.path.split('\\');
    const fileName = path.pop();
    const folder = path.pop();
    return `${folder}/${fileName}`;
}

export const unlinkFile = (path: any) => {
    try {
        if (!path) throw new Error('No hay imagen para eliminar');
        fs.unlinkSync(`src/uploads/${path}`)
    } catch (error) {
        console.error(error);
    }
}