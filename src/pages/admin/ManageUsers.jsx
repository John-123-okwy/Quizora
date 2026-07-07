import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, promoteToAdmin, demoteToUser } from '../../firebase/users.service';
import styles from './ManageUsers.module.css';

export default function ManageUsers() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleConfirmAction = async () => {
    const { type, user } = pendingAction;
    if (type === 'promote') {
      await promoteToAdmin(user.id, user.fullName, actor);
    } else {
      await demoteToUser(user.id, user.fullName, actor);
    }
    setPendingAction(null);
    await loadUsers();
  };

  const roleBadgeClass = (role) => {
    if (role === 'chief') return styles.roleChief;
    if (role === 'admin') return styles.roleAdmin;
    return styles.roleUser;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading users..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Manage Users</h1>
          <p>Promote users to admin or demote admins back to regular users. Chief Admins cannot be modified here.</p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser.uid;
                const isChief = u.role === 'chief';

                return (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${roleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {isChief || isSelf ? (
                        <span className={styles.protectedTag}>
                          {isChief ? 'Protected role' : 'This is you'}
                        </span>
                      ) : u.role === 'admin' ? (
                        <button
                          className={`${styles.actionBtn} ${styles.demoteBtn}`}
                          onClick={() => setPendingAction({ type: 'demote', user: u })}
                        >
                          Demote to User
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionBtn} ${styles.promoteBtn}`}
                          onClick={() => setPendingAction({ type: 'promote', user: u })}
                        >
                          Promote to Admin
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pendingAction && (
        <ConfirmModal
          title={pendingAction.type === 'promote' ? 'Promote User' : 'Demote Admin'}
          message={
            pendingAction.type === 'promote'
              ? `Give ${pendingAction.user.fullName} admin access? They'll be able to manage questions and results.`
              : `Remove admin access from ${pendingAction.user.fullName}? They'll return to a normal student account.`
          }
          confirmLabel={pendingAction.type === 'promote' ? 'Promote' : 'Demote'}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </DashboardLayout>
  );
}