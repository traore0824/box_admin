# 📚 Documentation Complète - Nouvelles Fonctionnalités BOX

## Table des matières

1. [Système de Gestion du PIN](#système-de-gestion-du-pin)
2. [APIs de Retrait avec OTP](#apis-de-retrait-avec-otp)
3. [Champ user_have_caisse](#champ-user_have_caisse)
4. [APIs Wallet](#apis-wallet)
5. [APIs de Gestion des Transactions](#apis-de-gestion-des-transactions)
6. [Filtrage des Transactions](#filtrage-des-transactions)

---

## 🔐 Système de Gestion du PIN

### Vue d'ensemble

Le système de gestion du PIN permet de gérer le blocage et déblocage du PIN des utilisateurs avec une vérification obligatoire avant la création d'un nouveau PIN après déblocage par un administrateur.

### Modèle PinManagement

**Fichier :** `authen/models.py`

Le modèle `PinManagement` gère l'état du PIN pour chaque utilisateur :

```python
class PinManagement(models.Model):
    user = OneToOneField(User)  # Relation 1-1 avec User
    is_blocked = BooleanField  # PIN bloqué ou non
    blocked_at = DateTimeField  # Date de blocage
    unblocked_at = DateTimeField  # Date de déblocage
    unblocked_by = ForeignKey(User)  # Admin qui a débloqué
    requires_verification = BooleanField  # Vérification requise avant création
    verification_otp = CharField  # OTP de vérification
    verification_otp_created_at = DateTimeField  # Date création OTP
    verification_completed = BooleanField  # Vérification complétée
```

**Méthodes disponibles :**
- `block()` : Bloque le PIN de l'utilisateur
- `unblock(unblocked_by_user)` : Débloque le PIN et exige une vérification
- `mark_verification_completed()` : Marque la vérification comme complétée

### Installation

```bash
# Créer la migration
python manage.py makemigrations authen

# Appliquer la migration
python manage.py migrate authen
```

---

## 🔄 APIs de Gestion du PIN

### 1. Débloquer un utilisateur (Admin)

**Endpoint :** `POST /auth/toggle-block/`

**Permissions :** `IsCustomerServiceOrAdmin`

**Body :**
```json
{
    "user_id": "123"
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "is_block": false,
    "message": "Utilisateur débloqué",
    "block_reason": "pin",
    "requires_verification": true
}
```

**Comportement :**
- Si `block_reason = 'pin'` :
  - Crée/met à jour `PinManagement`
  - Marque `requires_verification = True`
  - Génère et envoie un OTP par email
  - Réinitialise `pin_incorrect_count = 0`
  - Met `pin_define = False`

---

### 2. Créer un PIN

**Endpoint :** `POST /auth/create-user-pin/`

**Permissions :** `AllowAny` (mais vérification requise si débloqué)

**Body :**
```json
{
    "email": "user@example.com",
    "pin": "1234",
    "verification_otp": "123456"  // Requis si requires_verification = True
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "PIN créé avec succès."
}
```

**Erreurs possibles :**
- `400` : Vérification requise - OTP manquant
- `400` : OTP invalide
- `400` : OTP expiré (5 minutes)
- `404` : Utilisateur introuvable

**Comportement :**
- Si `requires_verification = True` :
  - Vérifie que l'OTP est fourni
  - Vérifie que l'OTP correspond
  - Vérifie que l'OTP n'est pas expiré (5 minutes)
  - Marque la vérification comme complétée
  - Supprime l'ancien PIN
- Crée le nouveau PIN
- Réinitialise `pin_incorrect_count = 0`

---

### 3. Envoyer un OTP de vérification

**Endpoint :** `POST /auth/send-pin-verification-otp/`

**Permissions :** `AllowAny`

**Body :**
```json
{
    "email": "user@example.com"
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "OTP de vérification envoyé par email."
}
```

**Comportement :**
- Génère un nouvel OTP
- Envoie l'OTP par email
- Met à jour `verification_otp` et `verification_otp_created_at`

---

### 4. Valider un PIN

**Endpoint :** `POST /auth/validate-user-pin/`

**Permissions :** `AllowAny`

**Body :**
```json
{
    "email": "user@example.com",
    "pin": "1234"
}
```

**Réponse succès (200) :**
```json
{
    "status": "OK"
}
```

**Comportement :**
- Vérifie si le PIN est bloqué via `PinManagement`
- Vérifie le PIN
- Incrémente `pin_incorrect_count` si incorrect
- Bloque le compte si 3 erreurs
- Réinitialise le compteur si correct

---

### 5. Login avec vérification PIN

**Endpoint :** `POST /auth/login/`

**Body :**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Réponse avec vérification requise :**
```json
{
    "refresh": "...",
    "access": "...",
    "exp": 1234567890,
    "user": {
        "id": 123,
        "email": "user@example.com",
        "requires_pin_verification": true,
        "pin_verification_message": "Vous devez vérifier votre identité avant de créer un nouveau PIN.",
        ...
    }
}
```

---

## 💰 APIs de Retrait avec OTP

### 1. Envoyer un OTP de retrait

**Endpoint :** `POST /box/withdrawal/send-otp`

**Permissions :** `IsAuthenticated`

**Description :** Envoie un OTP par email à l'utilisateur connecté pour effectuer un retrait sur une caisse.

**Body :**
```json
{
    "caisse_id": "123"
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "OTP de vérification envoyé par email.",
    "caisse_id": "123",
    "expires_in_minutes": 5
}
```

**Erreurs possibles :**
- `404` : Caisse introuvable
- `403` : Utilisateur non autorisé (pas membre/créateur)
- `400` : Caisse pas dans un état permettant le retrait (status doit être "disabled" ou "done")

**Validations :**
- ✅ L'utilisateur doit être authentifié
- ✅ L'utilisateur doit être membre OU créateur de la caisse
- ✅ La caisse doit exister
- ✅ La caisse doit être terminée (status: "disabled" ou "done")

**Comportement :**
1. Vérifie les permissions
2. Génère un OTP unique
3. Stocke l'OTP dans `caisse.withdrawal_otp`
4. Enregistre la date de création dans `caisse.withdrawal_otp_created_at`
5. Envoie l'OTP par email à l'utilisateur connecté
6. Log l'action

---

### 2. Vérifier l'OTP de retrait

**Endpoint :** `POST /box/withdrawal/verify-otp`

**Permissions :** `IsAuthenticated`

**Description :** Vérifie l'OTP de retrait fourni par l'utilisateur.

**Body :**
```json
{
    "caisse_id": "123",
    "otp": "123456"
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "Code OTP vérifié avec succès.",
    "caisse_id": "123",
    "verified_at": "2024-01-15T10:30:00Z"
}
```

**Erreurs possibles :**
- `404` : Caisse introuvable
- `403` : Utilisateur non autorisé
- `400` : Aucun OTP généré pour cette caisse
- `400` : Code OTP invalide
- `400` : Code OTP expiré (après 5 minutes)

**Validations :**
- ✅ L'utilisateur doit être authentifié
- ✅ L'utilisateur doit être membre OU créateur de la caisse
- ✅ La caisse doit exister
- ✅ Un OTP doit avoir été généré
- ✅ L'OTP doit correspondre
- ✅ L'OTP ne doit pas être expiré (5 minutes)

**Comportement :**
1. Vérifie les permissions
2. Vérifie que l'OTP existe
3. Compare l'OTP fourni avec celui stocké
4. Vérifie que l'OTP n'est pas expiré
5. Log l'action (succès ou échec)

---

## 👤 Champ user_have_caisse

### Description

Le champ `user_have_caisse` indique si un utilisateur est propriétaire ou membre d'au moins une caisse, peu importe le statut de la caisse.

### Où est-il disponible ?

Le champ est disponible dans :
- ✅ `UserDetailSerializer` (endpoint `/auth/me/`)
- ✅ Liste des utilisateurs (endpoint `/auth/listUser/`)

### Format de réponse

**Dans UserDetailSerializer :**
```json
{
    "id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_have_caisse": true,
    ...
}
```

### Logique de calcul

```python
def get_user_have_caisse(self, obj):
    # Vérifier si l'utilisateur est propriétaire d'au moins une caisse
    is_owner = obj.owner_caisse.exists()
    
    # Vérifier si l'utilisateur est membre d'au moins une caisse
    is_member = Caisse.objects.filter(members=obj).exists()
    
    return is_owner or is_member
```

**Retourne `True` si :**
- L'utilisateur est propriétaire d'au moins une caisse (via `owner_caisse`)
- OU l'utilisateur est membre d'au moins une caisse (via `members`)

**Retourne `False` si :**
- L'utilisateur n'est ni propriétaire ni membre d'aucune caisse

**Note :** Le statut de la caisse n'est pas pris en compte. Même si une caisse est "cancel" ou "done", elle compte toujours.

---

## 💳 APIs Wallet

### Vue d'ensemble

Le système de wallet permet aux utilisateurs de gérer leur solde virtuel. Chaque mouvement d'argent est tracé via des `WalletTransaction` pour une traçabilité complète.

### 1. Retirer de son wallet

**Endpoint :** `POST /box/wallet/withdrawal`

**Permissions :** `IsAuthenticated`

**Description :** Permet à l'utilisateur de retirer de l'argent de son wallet. ⚠️ **SÉCURITÉ CRITIQUE** - Retire immédiatement l'argent du wallet.

**Body :**
```json
{
    "amount": "1000.00",
    "description": "Retrait pour..."  // Optionnel
}
```

**Réponse succès (201) :**
```json
{
    "success": true,
    "message": "Retrait effectué avec succès",
    "data": {
        "amount": "1000.00",
        "balance_before": "5000.00",
        "balance_after": "4000.00",
        "wallet_transaction_id": 123,
        "created_at": "2024-01-15T10:30:00Z"
    }
}
```

**Erreurs possibles :**
- `400` : Montant requis
- `400` : Montant invalide
- `400` : Montant doit être supérieur à 0
- `400` : Solde insuffisant

**Comportement :**
1. Vérifie que le montant est valide
2. Vérifie que le solde est suffisant
3. Retire l'argent du wallet (avec verrouillage et traçabilité)
4. Crée une `WalletTransaction` de type "withdrawal"
5. Envoie un événement Pusher
6. Log l'action

---

### 2. Lister les transactions wallet

**Endpoint :** `GET /box/wallet/transactions`

**Permissions :** `IsAuthenticated`

**Description :** Liste toutes les transactions wallet de l'utilisateur connecté avec pagination.

**Query Parameters :**
- `transaction_type` (optionnel) : Filtrer par type ("deposit", "withdrawal", etc.)
- `status` (optionnel) : Filtrer par statut ("completed", "pending", etc.)
- `page` (optionnel) : Numéro de page
- `page_size` (optionnel) : Taille de la page

**Exemple de requête :**
```
GET /box/wallet/transactions?transaction_type=deposit&status=completed&page=1
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "data": [
        {
            "id": 123,
            "transaction_type": "deposit",
            "amount": "5000.00",
            "balance_before": "0.00",
            "balance_after": "5000.00",
            "status": "completed",
            "description": "Dépôt via transaction",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ],
    "summary": {
        "current_balance": "5000.00",
        "total_deposits": "10000.00",
        "total_withdrawals": "5000.00"
    }
}
```

**Comportement :**
- Retourne les transactions de l'utilisateur connecté
- Inclut un résumé avec le solde actuel, total dépôts et total retraits
- Supporte la pagination
- Permet de filtrer par type et statut

---

### 3. Obtenir le solde du wallet

**Endpoint :** `GET /box/wallet/balance`

**Permissions :** `IsAuthenticated`

**Description :** Retourne le solde actuel du wallet ainsi que les totaux de dépôts et retraits.

**Réponse succès (200) :**
```json
{
    "success": true,
    "data": {
        "current_balance": "5000.00",
        "total_deposits": "10000.00",
        "total_withdrawals": "5000.00",
        "available_amount": "5000.00",  // Pour compatibilité
        "withdraw_amount": "5000.00"     // Pour compatibilité
    }
}
```

---

### 4. Liste des wallets (Admin)

**Endpoint :** `GET /box/wallet/admin/list`

**Permissions :** `IsAdminUser`

**Description :** Liste tous les wallets avec recherche et pagination (Admin uniquement).

**Query Parameters :**
- `q` (optionnel) : Recherche par email, nom, prénom ou téléphone de l'utilisateur
- `page` (optionnel) : Numéro de page
- `page_size` (optionnel) : Taille de la page

**Exemple de requête :**
```
GET /box/wallet/admin/list?q=john@example.com&page=1
```

**Réponse succès (200) :**
```json
{
    "count": 100,
    "next": "http://api.example.com/box/wallet/admin/list?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": {
                "id": 123,
                "email": "user@example.com",
                "fullname": "John Doe"
            },
            "balance": "5000.00",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### 5. Transactions wallet d'un utilisateur (Admin)

**Endpoint :** `GET /box/wallet/admin/transactions`

**Permissions :** `IsAdminUser`

**Description :** Liste toutes les transactions wallet d'un utilisateur spécifique (Admin uniquement).

**Query Parameters :**
- `user_id` (requis) : ID de l'utilisateur
- `transaction_type` (optionnel) : Filtrer par type
- `status` (optionnel) : Filtrer par statut
- `page` (optionnel) : Numéro de page
- `page_size` (optionnel) : Taille de la page

**Exemple de requête :**
```
GET /box/wallet/admin/transactions?user_id=123&transaction_type=deposit
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "user": {
        "id": 123,
        "email": "user@example.com",
        "fullname": "John Doe"
    },
    "data": [
        {
            "id": 456,
            "transaction_type": "deposit",
            "amount": "5000.00",
            "balance_before": "0.00",
            "balance_after": "5000.00",
            "status": "completed",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ],
    "summary": {
        "current_balance": "5000.00",
        "total_deposits": "10000.00",
        "total_withdrawals": "5000.00"
    }
}
```

---

### 6. Initialiser tous les wallets (Admin)

**Endpoint :** `POST /box/wallet/initialize-all`

**Permissions :** Aucune (utilisation unique)

**Description :** ⚠️ **UTILISATION UNIQUE** - Initialise le wallet de tous les utilisateurs avec leur solde actuel. Cette API crée une `WalletTransaction` pour chaque utilisateur avec leur `available_amout` actuel. À appeler une seule fois pour migrer les données existantes.

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "Initialisation terminée",
    "total_users": 1000,
    "success": 950,
    "errors": 5,
    "skipped": 45,
    "details": []
}
```

**Comportement :**
- Parcourt tous les utilisateurs (sauf admins)
- Calcule le solde réel depuis les transactions
- Crée une transaction initiale si nécessaire
- Retourne un rapport détaillé

---

## 🔄 APIs de Gestion des Transactions

### 1. Approuver une transaction de retrait/annulation

**Endpoint :** `POST /box/transaction-approve-withdrawal`

**Permissions :** `IsAuthenticated` (Admin uniquement)

**Description :** Approuve une transaction de retrait ou d'annulation. Effectue les vérifications suivantes :
1. Récupère tous les dépôts acceptés de la caisse
2. Fait la somme des montants des dépôts
3. Vérifie que la somme = `caisse.amount_already_paid`
4. Si OK : retire l'argent du wallet, change le statut et envoie une notification

⚠️ **IMPORTANT** : Le retrait du wallet se fait ICI lors de l'approbation admin (pas à la création).

**Body :**
```json
{
    "transaction_id": 456
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "message": "Transaction approuvée avec succès. Somme des dépôts vérifiée: 50000.00 XOF",
    "transaction": {
        "id": 456,
        "status": "accept",
        "public_reference": "TXN-123456",
        "amount": "10000.00",
        "type_trans": "withdrawal",
        ...
    },
    "wallet_balance": "25000.00"
}
```

**Erreurs possibles :**
- `403` : Seuls les administrateurs peuvent approuver des transactions
- `404` : Transaction introuvable
- `400` : Type de transaction invalide (doit être "withdrawal" ou "cancellation")
- `400` : La transaction doit être en statut 'pending'
- `400` : Montant incohérent (somme des dépôts ≠ amount_already_paid)
- `500` : Erreur lors du retrait du wallet

**Comportement :**
1. Vérifie les permissions (Admin uniquement)
2. Vérifie que la transaction est de type "withdrawal" ou "cancellation"
3. Vérifie que la transaction est en statut "pending"
4. Calcule la somme des dépôts acceptés de la caisse
5. Vérifie la cohérence avec `amount_already_paid`
6. Retire l'argent du wallet de l'utilisateur
7. Change le statut de la transaction à "accept"
8. Met à jour la caisse (montant et statut)
9. Log l'action avec audit complet

---

### 2. Valider une transaction de retrait/annulation (sans changer le statut)

**Endpoint :** `POST /box/transaction-validate-withdrawal/`

**Permissions :** `IsAuthenticated` (Admin uniquement)

**Description :** Valide une transaction de retrait ou d'annulation SANS changer le statut. Effectue les mêmes vérifications que `ApproveWithdrawalTransactionView` mais retourne juste un message de validation.

**Body :**
```json
{
    "transaction_id": 456
}
```

**Réponse VALID (200) :**
```json
{
    "success": true,
    "valid": true,
    "message": "Transaction valide. Somme des dépôts vérifiée: 50000.00 XOF. Montant du retrait: 10000.00 XOF",
    "details": {
        "transaction_id": 456,
        "transaction_type": "withdrawal",
        "transaction_amount": "10000.00",
        "total_deposits": "50000.00",
        "amount_already_paid": "50000.00",
        "caisse_id": 789,
        "caisse_name": "Ma Caisse"
    }
}
```

**Réponse INVALID (200) :**
```json
{
    "success": true,
    "valid": false,
    "message": "Montant incohérent. Somme des dépôts: 50000.00 XOF, amount_already_paid: 49000.00 XOF, Différence: 1000.00 XOF",
    "details": {
        "total_deposits": "50000.00",
        "amount_already_paid": "49000.00",
        "difference": "1000.00",
        "tolerance": "1.00"
    }
}
```

**Erreurs possibles :**
- `403` : Seuls les administrateurs peuvent valider des transactions
- `404` : Transaction introuvable
- `400` : Type de transaction invalide
- `400` : La transaction doit être en statut 'pending'

**Comportement :**
- Effectue les mêmes vérifications que l'approbation
- Ne modifie rien dans la base de données
- Retourne uniquement un message de validation

---

### 3. Vérifier le statut Feexpay d'une transaction

**Endpoint :** `POST /box/transaction-check-feexpay-status/`

**Permissions :** `IsAuthenticated`

**Description :** Vérifie le statut d'une transaction sur Feexpay. Prend l'ID de la transaction, récupère la référence Feexpay, et interroge l'API Feexpay pour obtenir le statut actuel.

**Body :**
```json
{
    "transaction_id": 123
}
```

**Réponse succès (200) :**
```json
{
    "success": true,
    "transaction_id": 123,
    "reference": "FEEXPAY-REF-123456",
    "feexpay_status": "SUCCESSFUL",
    "feexpay_data": {
        "status": "SUCCESSFUL",
        "amount": "5000.00",
        ...
    },
    "local_status": "pending"
}
```

**Erreurs possibles :**
- `400` : transaction_id est requis
- `404` : Transaction introuvable
- `400` : Cette transaction n'a pas de référence Feexpay
- `500` : Erreur API Feexpay

---

### 4. Mettre à jour le statut d'une transaction (vérifie Feexpay)

**Endpoint :** `POST /box/transaction/update-status/`

**Permissions :** `IsCustomerServiceOrAdmin`

**Description :** Met à jour le statut d'une transaction en vérifiant Feexpay :
- Vérifie le statut sur Feexpay
- Si SUCCESSFUL : vérifie si l'argent a été versé, le verse si nécessaire, traite les processus (bonus de parrainage, commissions, etc.)
- Si FAILED : vérifie si l'argent a été versé, le retire si nécessaire, marque en error

**Body :**
```json
{
    "transaction_id": 123
}
```

**Réponse SUCCESS (SUCCESSFUL sur Feexpay) :**
```json
{
    "success": true,
    "message": "Statut de la transaction mis à jour avec succès",
    "transaction": {
        "id": 123,
        "status": "accept",
        "previous_status": "pending",
        "feexpay_status": "SUCCESSFUL"
    },
    "wallet_updated": true,
    "amount_added": "5000.00"
}
```

**Réponse SUCCESS (FAILED sur Feexpay) :**
```json
{
    "success": true,
    "message": "Statut de la transaction mis à jour (FAILED)",
    "transaction": {
        "id": 123,
        "status": "error",
        "previous_status": "pending",
        "feexpay_status": "FAILED"
    },
    "wallet_refunded": false,
    "amount_refunded": null
}
```

**Erreurs possibles :**
- `403` : Seuls les administrateurs et le service client peuvent mettre à jour le statut
- `400` : transaction_id est requis
- `404` : Transaction introuvable
- `400` : Cette transaction n'a pas de référence Feexpay
- `400` : Transaction déjà en statut final

**Comportement :**
1. Vérifie les permissions
2. Récupère la transaction avec verrouillage
3. Vérifie que la transaction a une référence Feexpay
4. Interroge l'API Feexpay pour obtenir le statut
5. Si SUCCESSFUL :
   - Vérifie si l'argent a déjà été versé au wallet
   - Verse l'argent au wallet si nécessaire
   - Traite les bonus de parrainage
   - Traite les commissions
   - Met à jour le statut de la transaction
   - Envoie des notifications
6. Si FAILED :
   - Vérifie si l'argent a été versé
   - Retire l'argent du wallet si nécessaire
   - Met à jour le statut à "error"
7. Log toutes les actions avec audit complet

---

## 🔍 Filtrage des Transactions

### Liste des transactions avec filtres

**Endpoint :** `GET /box/all-transaction`

**Permissions :** `IsAuthenticated`

**Description :** Liste toutes les transactions avec pagination et filtres multiples.

**Query Parameters disponibles :**
- `type_trans` (optionnel) : Filtrer par type de transaction
  - Valeurs possibles : `"deposit"`, `"withdrawal"`, `"cancellation"`
- `status` (optionnel) : Filtrer par statut
  - Valeurs possibles : `"pending"`, `"accept"`, `"error"`, `"expired"`, `"timeout"`
- `public_reference` (optionnel) : Filtrer par référence publique
- `phone` (optionnel) : Filtrer par numéro de téléphone
- `q` (optionnel) : Recherche textuelle (email, nom de caisse, référence publique, téléphone)
- `page` (optionnel) : Numéro de page
- `page_size` (optionnel) : Taille de la page

**Exemples de requêtes :**

1. **Filtrer par type de transaction :**
```
GET /box/all-transaction?type_trans=deposit
```

2. **Filtrer par type et statut :**
```
GET /box/all-transaction?type_trans=withdrawal&status=pending
```

3. **Recherche textuelle :**
```
GET /box/all-transaction?q=john@example.com
```

4. **Combinaison de filtres :**
```
GET /box/all-transaction?type_trans=deposit&status=accept&page=1&page_size=20
```

**Réponse succès (200) :**
```json
{
    "count": 150,
    "next": "http://api.example.com/box/all-transaction?page=2",
    "previous": null,
    "results": [
        {
            "id": 123,
            "type_trans": "deposit",
            "status": "accept",
            "amount": "5000.00",
            "public_reference": "TXN-123456",
            "phone": "+221771234567",
            "caisse": {
                "id": 789,
                "name": "Ma Caisse"
            },
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

**Comportement :**
- Les utilisateurs normaux voient uniquement leurs transactions ou celles des caisses partagées
- Les admins et Customer Service voient toutes les transactions (y compris caisses archivées)
- Les transactions des caisses archivées sont exclues pour les utilisateurs normaux
- Les résultats sont triés par date de création (plus récent en premier)
- Supporte la pagination

**Permissions :**
- Les utilisateurs normaux : seulement leurs transactions ou celles des caisses partagées
- Les admins et Customer Service : toutes les transactions

---

## 📋 Serializers

### SendWithdrawalOTPSerializer

**Fichier :** `box/serializers.py`

```python
class SendWithdrawalOTPSerializer(serializers.Serializer):
    caisse_id = serializers.CharField(required=True)
```

### VerifyWithdrawalOTPSerializer

**Fichier :** `box/serializers.py`

```python
class VerifyWithdrawalOTPSerializer(serializers.Serializer):
    caisse_id = serializers.CharField(required=True)
    otp = serializers.CharField(required=True)
```

---

## 🔗 Routes ajoutées

### Authentification
- `POST /auth/toggle-block/` - Débloquer/Bloquer un utilisateur (modifié)
- `POST /auth/create-user-pin/` - Créer un PIN (modifié)
- `POST /auth/send-pin-verification-otp/` - **ACTION ADMIN** : Envoyer OTP de vérification PIN à un utilisateur
- `POST /auth/validate-user-pin/` - Valider un PIN (modifié)
- `POST /auth/login/` - Login (modifié pour inclure requires_pin_verification)

### Retrait
- `POST /box/withdrawal/send-otp` - Envoyer OTP de retrait
- `POST /box/withdrawal/verify-otp` - Vérifier OTP de retrait

### Wallet
- `POST /box/wallet/withdrawal` - Retirer de son wallet
- `GET /box/wallet/transactions` - Lister les transactions wallet (avec filtres)
- `GET /box/wallet/balance` - Obtenir le solde du wallet
- `GET /box/wallet/admin/list` - Liste des wallets (Admin)
- `GET /box/wallet/admin/transactions` - Transactions wallet d'un utilisateur (Admin)
- `POST /box/wallet/initialize-all` - Initialiser tous les wallets (Admin, utilisation unique)

### Gestion des Transactions
- `POST /box/transaction-approve-withdrawal` - Approuver transaction retrait/annulation (Admin)
- `POST /box/transaction-validate-withdrawal/` - Valider transaction retrait/annulation (Admin, sans changer statut)
- `POST /box/transaction-check-feexpay-status/` - Vérifier le statut Feexpay d'une transaction
- `POST /box/transaction/update-status/` - Mettre à jour le statut d'une transaction (Admin/Customer Service)

### Transactions
- `GET /box/all-transaction` - Liste des transactions (modifié avec filtres par type_trans, status, etc.)

---

## ⚡ Actions Administrateur

### Gestion des Utilisateurs
- **Envoyer OTP PIN** : `POST /auth/send-pin-verification-otp/`
  - Envoie un OTP de vérification à un utilisateur pour réinitialiser son PIN
  - Accessible via le menu "Actions" de chaque utilisateur
  - Génère un nouvel OTP et l'envoie par email
  - Requis après déblocage d'un utilisateur par un admin

- **Bloquer/Débloquer** : `POST /auth/toggle-block/`
  - Change le statut de blocage d'un utilisateur
  - Pour le blocage PIN : met `requires_verification = True`
  - Accessible via le menu "Actions" de chaque utilisateur

- **Nommer Agent/Retirer Agent** : `POST /auth/toggle-agent/`
  - Change le statut agent/client d'un utilisateur
  - Accessible via le menu "Actions" de chaque utilisateur

- **Réinitialiser PIN** : `POST /auth/reset-pin/`
  - Réinitialise le PIN d'un utilisateur
  - Met `pin_define = false` et `pin_incorrect_count = 0`
  - Accessible via le menu "Actions" de chaque utilisateur

### Gestion des Transactions
- **Approuver Transaction** : `POST /box/transaction-approve-withdrawal`
  - Approuve un retrait ou une annulation
  - Vérifie la cohérence des montants avant approbation
  - Retire automatiquement l'argent du wallet

- **Valider Transaction** : `POST /box/transaction-validate-withdrawal/`
  - Valide une transaction sans changer son statut
  - Vérifie uniquement la cohérence des montants

- **Mettre à jour Statut** : `POST /box/transaction/update-status/`
  - Met à jour le statut d'une transaction en vérifiant Feexpay
  - Traite automatiquement les bonus et commissions

---

## 🔒 Sécurité

### Gestion du PIN
- ✅ OTP expire après 5 minutes
- ✅ OTP unique par utilisateur
- ✅ PIN supprimé avant création d'un nouveau après déblocage
- ✅ Vérification obligatoire après déblocage par admin
- ✅ Logs de toutes les actions

### Retrait avec OTP
- ✅ Vérification que l'utilisateur est membre/créateur
- ✅ OTP expire après 5 minutes
- ✅ OTP unique par caisse
- ✅ Logs des tentatives de vérification
- ✅ Validation du statut de la caisse

### Wallet
- ✅ Verrouillage des transactions pour éviter les doubles traitements
- ✅ Traçabilité complète de tous les mouvements d'argent
- ✅ Vérification du solde avant chaque retrait
- ✅ Transactions atomiques avec rollback en cas d'erreur
- ✅ Logs de toutes les opérations financières
- ✅ Références uniques pour éviter les doubles traitements

### Gestion des Transactions
- ✅ Vérification de cohérence des montants avant approbation
- ✅ Transactions atomiques avec verrous pour éviter les conditions de course
- ✅ Audit complet de toutes les actions administratives
- ✅ Vérification du statut Feexpay avant mise à jour
- ✅ Gestion automatique des bonus de parrainage et commissions
- ✅ Logs détaillés de toutes les opérations

---

## 📝 Exemples d'utilisation

### Scénario 1 : Déblocage PIN par admin

1. **Admin débloque l'utilisateur :**
```bash
POST /auth/toggle-block/
{
    "user_id": "123"
}
```

2. **Système génère et envoie OTP par email**

3. **Utilisateur crée un nouveau PIN :**
```bash
POST /auth/create-user-pin/
{
    "email": "user@example.com",
    "pin": "1234",
    "verification_otp": "123456"
}
```

### Scénario 2 : Retrait avec OTP

1. **Utilisateur demande un OTP :**
```bash
POST /box/withdrawal/send-otp
{
    "caisse_id": "123"
}
```

2. **Utilisateur reçoit l'OTP par email**

3. **Utilisateur vérifie l'OTP :**
```bash
POST /box/withdrawal/verify-otp
{
    "caisse_id": "123",
    "otp": "123456"
}
```

4. **Si OTP valide, l'utilisateur peut procéder au retrait**

### Scénario 3 : Utilisation du Wallet

1. **Vérifier le solde du wallet :**
```bash
GET /box/wallet/balance
```

2. **Lister les transactions wallet :**
```bash
GET /box/wallet/transactions?transaction_type=deposit&status=completed
```

3. **Effectuer un retrait :**
```bash
POST /box/wallet/withdrawal
{
    "amount": "1000.00",
    "description": "Retrait pour..."
}
```

### Scénario 4 : Gestion des transactions (Admin)

1. **Valider une transaction de retrait :**
```bash
POST /box/transaction-validate-withdrawal/
{
    "transaction_id": 456
}
```

2. **Si valide, approuver la transaction :**
```bash
POST /box/transaction-approve-withdrawal
{
    "transaction_id": 456
}
```

3. **Vérifier le statut Feexpay :**
```bash
POST /box/transaction-check-feexpay-status/
{
    "transaction_id": 123
}
```

4. **Mettre à jour le statut depuis Feexpay :**
```bash
POST /box/transaction/update-status/
{
    "transaction_id": 123
}
```

### Scénario 5 : Filtrer les transactions par type

1. **Lister uniquement les dépôts :**
```bash
GET /box/all-transaction?type_trans=deposit
```

2. **Lister les retraits en attente :**
```bash
GET /box/all-transaction?type_trans=withdrawal&status=pending
```

3. **Rechercher une transaction spécifique :**
```bash
GET /box/all-transaction?q=john@example.com&type_trans=deposit
```

---

## 🐛 Gestion des erreurs

### Codes HTTP
- `200` : Succès
- `400` : Erreur de validation / OTP invalide ou expiré
- `403` : Permission refusée
- `404` : Ressource introuvable

### Messages d'erreur
Tous les messages d'erreur sont en français et détaillés pour faciliter le débogage.

---

## 📊 Logs

Toutes les actions importantes sont loggées via `LoggerService` :
- Envoi d'OTP de retrait
- Vérification d'OTP (succès et échecs)
- Déblocage de PIN
- Création de PIN après vérification
- Retraits et dépôts wallet
- Approbation et validation de transactions
- Mise à jour de statut de transactions
- Vérifications Feexpay

---

## 🔄 Migration

Pour appliquer toutes les modifications :

```bash
# Créer les migrations
python manage.py makemigrations authen
python manage.py makemigrations box

# Appliquer les migrations
python manage.py migrate authen
python manage.py migrate box
```

---

## 📞 Support

Pour toute question ou problème, consultez :
- `PIN_MANAGEMENT_README.md` - Documentation détaillée du système PIN
- `DOCUMENTATION_COMPLETE.md` - Cette documentation

---

**Dernière mise à jour :** 2024

---

## 📝 Notes importantes

### Filtrage par type de transaction

Le filtrage par `type_trans` est disponible sur l'endpoint `GET /box/all-transaction` via le paramètre de requête `type_trans`. Les valeurs possibles sont :
- `"deposit"` : Pour filtrer uniquement les dépôts
- `"withdrawal"` : Pour filtrer uniquement les retraits
- `"cancellation"` : Pour filtrer uniquement les annulations

**Exemple :**
```
GET /box/all-transaction?type_trans=deposit&status=accept
```

Cette fonctionnalité permet de faciliter la recherche et l'analyse des transactions par type.

