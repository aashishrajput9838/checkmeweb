import { db, storage } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const messService = {
    async saveWeeklyMenu(payload: any) {
        await setDoc(doc(db, 'mess_menu', 'weekly'), payload, { merge: true });
    },

    async uploadOfficialPdf(file: File, userEmail: string) {
        const storageRef = ref(storage, 'menus/official-menu.pdf');
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        await setDoc(doc(db, 'mess_menu', 'pdfContent'), {
            url: downloadUrl,
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail
        });
        
        return downloadUrl;
    }
};
