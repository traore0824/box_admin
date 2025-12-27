# Documentation Admin - Système de Retrait de Commission Utilisateur

## 📋 Vue d'ensemble

Ce document décrit le système de gestion des retraits de commission pour les utilisateurs (agents). Les administrateurs peuvent visualiser, approuver ou rejeter les demandes de retrait de commission des utilisateurs.

---

## 🎯 Fonctionnalités

### 1. **Visualisation des demandes de retrait**

Les admins peuvent consulter toutes les demandes de retrait de commission via l'API de liste.

### 2. **Approbation/Rejet des retraits**

Les admins peuvent approuver ou rejeter les demandes de retrait. Lors de l'approbation :
- Le montant est retiré de la commission de l'utilisateur
- Les compteurs sont réinitialisés (`commission_amount` et `user_referral_count`)
- Une notification est envoyée à l'utilisateur

### 3. **Notifications Telegram**

Toutes les notifications Telegram sont maintenant envoyées à tous les utilisateurs Telegram enregistrés dans `TelegramUser`, et non plus uniquement aux admins.

---

## 🔌 APIs Disponibles

### 1. **Liste des retraits de commission**

**Endpoint :** `GET /box/user-commission/withdrawals`

**Permissions :** `IsCustomerServiceOrAdmin`

**Paramètres de requête (optionnels) :**
- `status` : Filtrer par statut (`pending`, `completed`, `rejected`, `cancelled`)

**Exemple de requête :**
```bash
GET /box/user-commission/withdrawals?status=pending
```

**Réponse :**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 123,
      "user_email": "agent@example.com",
      "amount": "5000.00",
      "status": "pending",
      "notes": null,
      "processed_by": null,
      "processed_by_email": null,
      "rejection_reason": null,
      "created_at": "2024-01-15T10:30:00Z",
      "processed_at": null
    }
  ]
}
```

---

### 2. **Détails d'un retrait**

**Endpoint :** `GET /box/user-commission/withdrawal/<id>`

**Permissions :** `IsCustomerServiceOrAdmin`

**Exemple de requête :**
```bash
GET /box/user-commission/withdrawal/1
```

**Réponse :**
```json
{
  "id": 1,
  "user": 123,
  "user_email": "agent@example.com",
  "amount": "5000.00",
  "status": "pending",
  "notes": null,
  "processed_by": null,
  "processed_by_email": null,
  "rejection_reason": null,
  "created_at": "2024-01-15T10:30:00Z",
  "processed_at": null
}
```

---

### 3. **Approuver/Rejeter un retrait**

**Endpoint :** `PATCH /box/user-commission/withdrawal/<id>/process`

**Permissions :** `IsCustomerServiceOrAdmin`

**Corps de la requête :**
```json
{
  "status": "completed",  // ou "rejected"
  "rejection_reason": "Raison du rejet (optionnel si rejected)"
}
```

**Exemple d'approbation :**
```bash
PATCH /box/user-commission/withdrawal/1/process
Content-Type: application/json

{
  "status": "completed"
}
```

**Exemple de rejet :**
```bash
PATCH /box/user-commission/withdrawal/1/process
Content-Type: application/json

{
  "status": "rejected",
  "rejection_reason": "Documents incomplets"
}
```

**Comportement lors de l'approbation :**
1. ✅ Vérification que l'utilisateur a toujours suffisamment de commission
2. ✅ Réinitialisation de `commission_amount` à 0
3. ✅ Réinitialisation de `user_referral_count` à 0 (dans le Reward)
4. ✅ Envoi d'une notification à l'utilisateur
5. ✅ Enregistrement de la date de traitement et de l'admin qui a traité

**Réponse (succès) :**
```json
{
  "id": 1,
  "user": 123,
  "user_email": "agent@example.com",
  "amount": "5000.00",
  "status": "completed",
  "processed_by": 1,
  "processed_by_email": "admin@example.com",
  "processed_at": "2024-01-15T11:00:00Z"
}
```

**Erreurs possibles :**
- `400 Bad Request` : L'utilisateur n'a plus suffisamment de commission disponible
- `404 Not Found` : Retrait introuvable ou déjà traité
- `403 Forbidden` : Permissions insuffisantes

---

## 📊 Statuts des retraits

| Statut | Description |
|--------|-------------|
| `pending` | Demande en attente de traitement |
| `completed` | Retrait approuvé et traité |
| `rejected` | Retrait rejeté par l'admin |
| `cancelled` | Retrait annulé par l'utilisateur |

---

## 🔔 Notifications Telegram

### Changement important

**Avant :** Les notifications Telegram étaient envoyées uniquement aux admins (`User.objects.filter(is_staff=True)`)

**Maintenant :** Les notifications Telegram sont envoyées à **tous les utilisateurs Telegram enregistrés** dans `TelegramUser.objects.all()`

### Types de notifications envoyées

1. **Nouvelle demande de retrait de commission**
   - Envoyée lorsqu'un utilisateur fait une demande de retrait
   - Contient : ID demande, montant, infos utilisateur, commission disponible, date

2. **Nouvelle demande de retrait (caisse)**
   - Envoyée lors d'une demande de retrait de caisse
   - Contient : Référence, montant, utilisateur, caisse, etc.

3. **Nouvelle demande d'annulation**
   - Envoyée lors d'une demande d'annulation de transaction
   - Contient : Référence, montant, utilisateur, caisse, etc.

4. **Transaction mise à jour vers success**
   - Envoyée lorsqu'une transaction passe au statut "accept"
   - Contient : Détails complets de la transaction

---

## 🔧 Interface Admin Django

### Accès au modèle UserCommissionWithdrawal

1. Connectez-vous à l'interface admin Django
2. Naviguez vers **Box** > **Retraits de Commission Utilisateur**
3. Vous pouvez :
   - Voir la liste de tous les retraits
   - Filtrer par statut
   - Rechercher par email utilisateur
   - Voir les détails de chaque retrait

### Champs affichés

- **ID** : Identifiant unique du retrait
- **User** : Utilisateur qui a fait la demande
- **Amount** : Montant demandé
- **Status** : Statut actuel (pending, completed, rejected, cancelled)
- **Processed by** : Admin qui a traité la demande
- **Created at** : Date de création
- **Processed at** : Date de traitement

---

## ⚠️ Points importants

### 1. **Réinitialisation des compteurs**

Lors de l'approbation d'un retrait, les compteurs suivants sont réinitialisés à 0 :
- `user.commission_amount` → 0
- `reward.user_referral_count` → 0 (si un Reward existe pour l'utilisateur)

**⚠️ Attention :** Cette réinitialisation est irréversible. Assurez-vous que le retrait est correct avant d'approuver.

### 2. **Vérifications de sécurité**

- ✅ Transaction atomique pour éviter les race conditions
- ✅ Vérification que l'utilisateur a toujours suffisamment de commission au moment de l'approbation
- ✅ Verrouillage de l'utilisateur avec `select_for_update()` pour éviter les modifications concurrentes

### 3. **Notifications utilisateur**

Lors de l'approbation, une notification est automatiquement envoyée à l'utilisateur avec le message :
> "Votre demande de retrait de commission de X FCFA a été approuvée et traitée avec succès. Vos compteurs ont été réinitialisés."

---

## 📝 Exemples d'utilisation

### Scénario 1 : Approuver un retrait

```bash
# 1. Lister les retraits en attente
GET /box/user-commission/withdrawals?status=pending

# 2. Voir les détails d'un retrait spécifique
GET /box/user-commission/withdrawal/1

# 3. Approuver le retrait
PATCH /box/user-commission/withdrawal/1/process
{
  "status": "completed"
}
```

### Scénario 2 : Rejeter un retrait

```bash
PATCH /box/user-commission/withdrawal/1/process
{
  "status": "rejected",
  "rejection_reason": "Documents manquants. Veuillez fournir votre pièce d'identité."
}
```

---

## 🔍 Logs et Audit

Toutes les actions sont loggées avec `LoggerService` :
- Création de demande : `💰 Demande de retrait de commission - {email} - Montant: {amount} FCFA`
- Approbation : `✅ Retrait de commission approuvé - {email} - {amount} FCFA - Compteurs reset`

---

## 🆘 Dépannage

### Problème : "L'utilisateur n'a plus suffisamment de commission disponible"

**Cause :** L'utilisateur a utilisé sa commission entre la demande et l'approbation.

**Solution :** Rejeter la demande et demander à l'utilisateur de créer une nouvelle demande avec le montant disponible.

### Problème : Notification Telegram non reçue

**Vérifications :**
1. Vérifier que des `TelegramUser` sont enregistrés dans la base de données
2. Vérifier que `TOKEN_BOT` est configuré dans les variables d'environnement
3. Vérifier les logs Celery pour voir si la tâche a été exécutée

---

## 📞 Support

Pour toute question ou problème, contactez l'équipe technique.

---

**Dernière mise à jour :** Janvier 2024

