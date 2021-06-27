export default ({ sponsoring }: any, adress_cms4devfest: string) => ({
    subject: 'Devfest Lille 2021 : Demande de partenariat bien reçue',
    body: `
Bonjour
<br><br>
Nous avons bien pris connaissance de votre souhait de devenir partenaire du Devfest Lille 2021 et nous vous en remercions.
<br><br>
Etant donné la forte affluence des demandes de partenariat, nous reviendrons vers vous par email dans une dizaine de jours maximum pour vous valider la réservation du pack ${sponsoring} ou de votre choix de pack sponsor de replis le cas échéant.
<br><br>
Vous pouvez suivre l'avancement de votre demande sur votre espace dédié : ${adress_cms4devfest}
<br><br>
Nous restons à votre disposition pour tout complément via l'adresse email contact@gdglille.org.
<br><br>
Cordialement 
<br><br>
L'équipe du Devfest Lille 2021
    `
});
