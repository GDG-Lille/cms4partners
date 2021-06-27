import { generateConvention, generateProformaInvoice, generateInvoice } from '../generator/lib/generator';
import * as os from 'os';
import * as admin from 'firebase-admin';
import { DocumentData } from '@google-cloud/firestore';

export async function storeFile(cloudStorageDest, tempPath) {
    await admin
        .storage()
        .bucket()
        .upload(os.tmpdir() + '/' + tempPath, { destination: cloudStorageDest + tempPath });

    return await admin
        .storage()
        .bucket()
        .file(cloudStorageDest + tempPath)
        .getSignedUrl({ action: 'read', expires: '03-17-2026' });
}
export async function generateAndStoreProformaInvoiceAndConvention(
    firestore: FirebaseFirestore.Firestore,
    company: DocumentData,
    id: string,
    settings
) {
    console.log('Generate Proforma invoice and convention for ' + id);

    const [convention, proformaInvoice] = await Promise.all([
        generateConvention({ ...company, id }, settings),
        generateProformaInvoice({ ...company, id }, settings)
    ]);

    const [publicConventionUrl, publicProformaInvoiceUrl] = await Promise.all([
        storeFile('convention/', convention),
        storeFile('devis/', proformaInvoice)
    ]);

    await firestore
        .doc('companies/' + id)
        .update({
            devisUrl: publicProformaInvoiceUrl,
            conventionUrl: publicConventionUrl
        })
        .catch(err => console.error(err));
}
export async function generateAndStoreInvoice(firestore: FirebaseFirestore.Firestore, company: DocumentData, id: string, settings) {
    console.log('Generate invoice ' + id);
    const invoice = await generateInvoice({ ...company, id }, settings);
    const publicInvoiceUrl = await storeFile('facture/', invoice);

    await firestore
        .doc('companies/' + id)
        .update({
            invoiceUrl: publicInvoiceUrl
        })
        .catch(err => console.error(err));
}

export async function generateInvoiceNumber(firestore: FirebaseFirestore.Firestore, id: string) {
    console.log('Generate Invoice Number');
    const invoiceNumber = await firestore
        .doc('configuration/invoice_2021')
        .get()
        .then(invoice => {
            return (invoice.data() as any).value;
        });

    const formattedNumber = '2021_' + invoiceNumber.padStart(3, '0');

    await firestore
        .doc('companies/' + id)
        .update({
            invoiceNumber: formattedNumber
        })
        .catch(err => console.error(err));

    return await firestore
        .doc('configuration/invoice_2021')
        .update({
            value: (parseInt(invoiceNumber, 10) + 1).toString()
        })
        .catch(err => console.error(err));
}
