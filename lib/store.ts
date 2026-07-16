import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  Provider, FAT, Port, Capel, Demand, User, LogAktivitas, 
  ProspekStatus, ValidasiStatus, Homepass
} from './types';
import { 
  mockProviders, mockFATs, mockPorts, mockCapels, mockDemands, mockUsers, mockLogs, mockHomepass
} from './mockData';
import { assertTransition } from './stateMachine';

interface AppState {
  // Auth State
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Master Data
  providers: Provider[];
  fats: FAT[];
  ports: Port[];
  users: User[];

  // Transactional Data
  capels: Capel[];
  demands: Demand[];
  logs: LogAktivitas[];
  homepasses: Homepass[];

  // Actions - Auth
  registerUser: (email: string, sandi: string) => User;
  approveUser: (id_user: string, status: ValidasiStatus) => void;

  // Actions - Sales
  registerCapel: (capelData: Omit<Capel, 'id_capel' | 'status_prospek' | 'tanggal_daftar'>) => Capel;
  registerDemand: (demandData: Omit<Demand, 'id_demand' | 'status_demand' | 'tanggal'>) => Demand;

  // Actions - Lead
  updateCapelStatus: (id_capel: string, newStatus: ProspekStatus, id_user_eksekutor: string) => void;
  reassignCapel: (id_capel: string, id_sales_baru: string, id_user_eksekutor: string) => void;
  
  // Actions - Admin
  addProvider: (providerData: Omit<Provider, 'id_provider'>) => Provider;
  updateProvider: (id_provider: string, data: Partial<Provider>) => void;
  deleteProvider: (id_provider: string) => void;

  addFat: (fatData: Omit<FAT, 'id_fat'>) => FAT;
  updateFat: (id_fat: string, data: Partial<FAT>) => void;
  deleteFat: (id_fat: string) => void;

  // Utilities
  _addLog: (log: Omit<LogAktivitas, 'id_log' | 'timestamp'>) => void;

  // Map Interactions
  selectedMapItemId: string | null;
  setSelectedMapItemId: (id: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  providers: mockProviders,
  fats: mockFATs,
  ports: mockPorts,
  users: mockUsers,

  capels: mockCapels,
  demands: mockDemands,
  logs: mockLogs,
  homepasses: mockHomepass,

  selectedMapItemId: null,
  setSelectedMapItemId: (id) => set({ selectedMapItemId: id }),

  _addLog: (log) => {
    const newLog: LogAktivitas = {
      ...log,
      id_log: uuidv4(),
      timestamp: new Date().toISOString()
    };
    set(state => ({ logs: [newLog, ...state.logs] }));
  },

  registerUser: (email, sandi) => {
    const exists = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("Email sudah terdaftar.");

    const newUser: User = {
      id_user: uuidv4(),
      nama: email.split('@')[0],
      email: email.toLowerCase(),
      sandi,
      role: 'Lead',
      no_hp: '',
      status_aktif: true,
      status_validasi: 'Pending',
      is_2fa_enabled: false,
      secret_2fa: '123456'
    };

    set(state => ({ users: [...state.users, newUser] }));
    return newUser;
  },

  approveUser: (id_user, status) => {
    set(state => ({
      users: state.users.map(u => u.id_user === id_user ? { ...u, status_validasi: status } : u)
    }));
  },

  registerCapel: (capelData) => {
    const state = get();
    // Rule 1: Anti double-booking
    const targetPort = state.ports.find(p => p.id_port === capelData.id_port_terpilih);
    if (!targetPort) throw new Error("Port tidak ditemukan.");
    if (targetPort.status_port !== 'Tersedia') throw new Error("Port tidak tersedia (Sudah terisi/rusak).");

    const newCapel: Capel = {
      ...capelData,
      id_capel: uuidv4(),
      status_prospek: 'Prospek Terdaftar',
      tanggal_daftar: new Date().toISOString()
    };

    // Update Port
    set(state => ({
      capels: [newCapel, ...state.capels],
      ports: state.ports.map(p => 
        p.id_port === targetPort.id_port 
          ? { ...p, status_port: 'Terisi', id_capel_aktif: newCapel.id_capel }
          : p
      )
    }));

    // Add Log
    get()._addLog({
      entitas: 'Capel',
      id_entitas: newCapel.id_capel,
      aksi: 'Registrasi Baru',
      nilai_lama: null,
      nilai_baru: 'Prospek Terdaftar',
      id_user_eksekutor: capelData.id_sales
    });

    return newCapel;
  },

  registerDemand: (demandData) => {
    const newDemand: Demand = {
      ...demandData,
      id_demand: uuidv4(),
      status_demand: 'Baru',
      tanggal: new Date().toISOString()
    };

    set(state => ({ demands: [newDemand, ...state.demands] }));
    return newDemand;
  },

  updateCapelStatus: (id_capel, newStatus, id_user_eksekutor) => {
    const state = get();
    const capel = state.capels.find(c => c.id_capel === id_capel);
    if (!capel) throw new Error("Capel tidak ditemukan.");

    // Rule 7: State machine assertion
    assertTransition(capel.status_prospek, newStatus);

    set(state => ({
      capels: state.capels.map(c => 
        c.id_capel === id_capel ? { ...c, status_prospek: newStatus } : c
      )
    }));

    // Add log
    get()._addLog({
      entitas: 'Capel',
      id_entitas: id_capel,
      aksi: 'Ubah status prospek',
      nilai_lama: capel.status_prospek,
      nilai_baru: newStatus,
      id_user_eksekutor
    });

    // Handle terminal state port freeing if needed. 
    // If Gagal, free the port so others can use it.
    if (newStatus === 'Gagal') {
      set(state => ({
        ports: state.ports.map(p => 
          p.id_capel_aktif === id_capel 
            ? { ...p, status_port: 'Tersedia', id_capel_aktif: null }
            : p
        )
      }));
    }
  },

  reassignCapel: (id_capel, id_sales_baru, id_user_eksekutor) => {
    const state = get();
    const capel = state.capels.find(c => c.id_capel === id_capel);
    if (!capel) return;

    const oldSales = capel.id_sales;
    set(state => ({
      capels: state.capels.map(c => 
        c.id_capel === id_capel ? { ...c, id_sales: id_sales_baru } : c
      )
    }));

    get()._addLog({
      entitas: 'Capel',
      id_entitas: id_capel,
      aksi: 'Reassign Kepemilikan',
      nilai_lama: oldSales,
      nilai_baru: id_sales_baru,
      id_user_eksekutor
    });
  },

  addFat: (fatData) => {
    const newFat: FAT = {
      ...fatData,
      id_fat: uuidv4()
    };
    
    // Auto-generate ports based on capacity
    const newPorts: Port[] = Array.from({ length: 8 }).map((_, i) => ({
      id_port: uuidv4(),
      id_fat: newFat.id_fat,
      nomor_port: i + 1,
      status_port: 'Tersedia',
      id_capel_aktif: null
    }));

    set(state => ({
      fats: [newFat, ...state.fats],
      ports: [...state.ports, ...newPorts]
    }));

    return newFat;
  },

  updateFat: (id_fat, data) => {
    set(state => ({
      fats: state.fats.map(f => f.id_fat === id_fat ? { ...f, ...data } : f)
    }));
  },

  deleteFat: (id_fat) => {
    set(state => ({
      fats: state.fats.filter(f => f.id_fat !== id_fat),
      ports: state.ports.filter(p => p.id_fat !== id_fat)
    }));
  },

  addProvider: (providerData) => {
    const newProvider: Provider = {
      ...providerData,
      id_provider: uuidv4()
    };
    set(state => ({ providers: [...state.providers, newProvider] }));
    return newProvider;
  },

  updateProvider: (id_provider, data) => {
    set(state => ({
      providers: state.providers.map(p => p.id_provider === id_provider ? { ...p, ...data } : p)
    }));
  },

  deleteProvider: (id_provider) => {
    set(state => ({
      providers: state.providers.filter(p => p.id_provider !== id_provider)
    }));
  }
}));
