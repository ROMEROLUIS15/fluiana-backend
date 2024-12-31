//THIS FUNCTION SENDS LETTERS
// const generateVerificationCode = (length: number = 6): string => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
//     let code = ''
//     for (let i = 0; i < length; i++) {
//       const randomIndex = Math.floor(Math.random() * characters.length)
//       code += characters[randomIndex]
//     }
//     return code
//   }
  
// THIS FUNCTION SENDS NUMBERS
const generateVerificationCode = (length: number = 6): string => {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10).toString()
    }
    return code
}

  export default generateVerificationCode;
  