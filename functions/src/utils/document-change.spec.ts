import { onDocumentChange } from './document-change';
import { Timestamp } from '@google-cloud/firestore';

jest.mock('./mail', () => {
    return { sendEmailToAllContacts: () => new Promise(resolve => resolve()) };
});

const files = require('./files');
files.generateAndStoreInvoice = jest.fn();
files.generateInvoiceNumber = jest.fn();
files.generateAndStoreProformaInvoiceAndConvention = jest.fn();

const settings = {
    convention: {
        edition: 2021
    },
    gdg: {},
    hosting: {}
};
describe('onDocumentChange', () => {
    let firestore;
    const update = jest.fn();
    beforeEach(() => {
        firestore = {
            doc() {
                return {
                    update
                };
            }
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should set the status sign to pending', async () => {
        const date = Timestamp.fromDate(new Date());

        const before = { status: {}, creationDate: date };
        const after = { status: { validated: 'done' }, creationDate: date };
        await onDocumentChange(firestore, before, after, '0', settings);

        expect(files.generateInvoiceNumber).toHaveBeenLastCalledWith(firestore, '0');
        expect(files.generateAndStoreProformaInvoiceAndConvention).toHaveBeenLastCalledWith(firestore, after, '0', settings);

        expect(update).toHaveBeenCalledWith({
            status: {
                validated: 'done',
                sign: 'pending'
            }
        });
    });

    it('should set the status paid to pending', async () => {
        const before = { status: {} };
        const after = { status: { sign: 'done' } };
        await onDocumentChange(firestore, before, after, '0', settings);
        expect(update).toHaveBeenCalledWith({
            status: {
                paid: 'pending',
                sign: 'done'
            }
        });
    });

    it('should set the status received to pending', async () => {
        const before = { status: {} };
        const after = { status: { paid: 'done' } };
        await onDocumentChange(firestore, before, after, '0', settings);

        // TEST Send mail
        expect(files.generateAndStoreInvoice).toHaveBeenLastCalledWith(firestore, after, '0', settings);
        expect(update).toHaveBeenCalledWith({
            status: {
                received: 'pending',
                code: 'pending',
                paid: 'done'
            }
        });
    });

    it('should set the status received to pending', async () => {
        const before = { status: {} };
        const after = { twitter: 't', linkedin: 'l', status: { received: 'pending' } };
        await onDocumentChange(firestore, before, after, '0', settings);
        expect(update).toHaveBeenCalledWith({
            status: {
                communicated: 'pending',
                received: 'done'
            }
        });
    });

    it('should set the status code to done', async () => {
        const before = { status: {} };
        const after = { codes: { 1: true, 2: true, 3: true }, status: { code: 'pending' } };
        await onDocumentChange(firestore, before, after, '0', settings);
        expect(update).toHaveBeenCalledWith({
            status: {
                code: 'done'
            }
        });
    });

    it('should keep the status code at pending if all codes are not used', async () => {
        const before = { status: {} };
        const after = { codes: { 1: true, 2: true, 3: false }, status: { code: 'pending' } };
        await onDocumentChange(firestore, before, after, '0', settings);
        expect(update).not.toHaveBeenCalledWith();
    });

    it('should keep the status code at pending if the codes property is not defined', async () => {
        const before = { status: {} };
        const after = { status: { code: 'pending' } };
        await onDocumentChange(firestore, before, after, '0', settings);
        expect(update).not.toHaveBeenCalledWith();
    });
});
