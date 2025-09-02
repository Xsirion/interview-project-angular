import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ConnectionStatus, Stock } from '../model/stock.model';
import { SignalRService } from '../services/signalr.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, timer, from } from 'rxjs';

// Interfejs dla animacji
// export interface StockAnimation {
//   symbol: string;
//   field: string;
//   type: 'increase' | 'decrease' | 'time-update';
//   timestamp: number;
// }

type AnimationType = 'increase' | 'decrease' | 'time-update';

export interface StocksState {
  stocks: Stock[];
  isLoading: boolean;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  error: string | null;
  lastUpdateTime: string;
  // Dodane dla animacji
  activeAnimations: Set<string>;
  // animations: StockAnimation[];
  // previousValues: Record<string, Stock>; // Poprzednie wartości dla porównania
}

const initialState: StocksState = {
  stocks: [],
  isLoading: false,
  isConnected: false,
  connectionStatus: ConnectionStatus.Disconnected,
  error: null,
  lastUpdateTime: '',
  activeAnimations: new Set<string>(),
  // animations: [],
  // previousValues: {},
};

export const StocksStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state) => ({
    stocksCount: computed(() => state.stocks().length),
    gainCount: computed(() => state.stocks().filter((stock) => stock.change > 0).length),
    lossCount: computed(() => state.stocks().filter((stock) => stock.change < 0).length),

    // Computed dla animacji
    hasAnimations: computed(() => state.activeAnimations().size > 0),

    // Mapa animacji według symbolu i pola
    // animationMap: computed(() => {
    //   const map = new Map<string, StockAnimation>();
    //   state.animations().forEach((anim) => {
    //     const key = `${anim.symbol}-${anim.field}`;
    //     map.set(key, anim);
    //   });
    //   return map;
    // }),
  })),

  withMethods((store, signalRService = inject(SignalRService)) => {
    const methods = {
      setLoading(isLoading: boolean) {
        patchState(store, { isLoading });
      },

      setConnectionStatus(status: ConnectionStatus) {
        patchState(store, { connectionStatus: status });
      },

      setError(error: string | null) {
        patchState(store, { error });
      },

      clearError() {
        patchState(store, { error: null });
      },

      // UPROSZCZONA animacja - jedna metoda do wszystkiego
      triggerAnimation(symbol: string, field: string, type: AnimationType) {
        const animationKey = `${symbol}-${field}-${type}`;
        const currentAnimations = new Set(store.activeAnimations());

        // Dodaj animację
        currentAnimations.add(animationKey);
        patchState(store, { activeAnimations: currentAnimations });

        // Usuń po czasie
        const duration = type === 'time-update' ? 1500 : 800;
        (globalThis as any).setTimeout(() => {
          const updatedAnimations = new Set(store.activeAnimations());
          updatedAnimations.delete(animationKey);
          patchState(store, { activeAnimations: updatedAnimations });
        }, duration);
      },

      // UPROSZCZONA detekcja zmian
      detectChanges(newStock: Stock, oldStock?: Stock) {
        if (!oldStock) return;

        // Sprawdź tylko kluczowe pola
        if (oldStock.price !== newStock.price) {
          const type = newStock.price > oldStock.price ? 'increase' : 'decrease';
          this.triggerAnimation(newStock.symbol, 'price', type);
        }

        if (oldStock.change !== newStock.change) {
          const type = newStock.change > oldStock.change ? 'increase' : 'decrease';
          this.triggerAnimation(newStock.symbol, 'change', type);
        }

        if (oldStock.lastUpdate !== newStock.lastUpdate) {
          this.triggerAnimation(newStock.symbol, 'lastUpdate', 'time-update');
        }
      },

      updateStock(updatedStock: Stock) {
        const currentStocks = store.stocks();
        const oldStock = currentStocks.find((s) => s.symbol === updatedStock.symbol);

        // Animacje
        if (oldStock) {
          this.detectChanges(updatedStock, oldStock);
        }

        // Aktualizacja danych
        const updatedStocks = currentStocks.map((stock) =>
          stock.symbol === updatedStock.symbol ? updatedStock : stock,
        );

        patchState(store, {
          stocks: updatedStocks,
          lastUpdateTime: new Date().toISOString(),
        });
      },

      setStocks(stocks: Stock[]) {
        patchState(store, {
          stocks,
          lastUpdateTime: new Date().toISOString(),
          error: null,
        });
      },

      // UPROSZCZONA metoda sprawdzania animacji
      hasAnimation(symbol: string, field: string, type?: AnimationType): boolean {
        const animations = store.activeAnimations();
        if (type) {
          return animations.has(`${symbol}-${field}-${type}`);
        }
        // Sprawdź czy ma jakąkolwiek animację dla tego pola
        return Array.from(animations).some((key) => key.startsWith(`${symbol}-${field}-`));
      },

      // Reszta metod bez zmian...
      initialize: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            signalRService
              .connect()
              .then(() => ({ success: true }))
              .catch(() => ({ success: false })),
          ),
          tap(({ success }) => {
            if (!success) methods.loadStocksHttp();
          }),
          switchMap(() =>
            timer(3000).pipe(
              tap(() => {
                if (store.stocks().length === 0) {
                  patchState(store, {
                    error: 'Brak danych z serwera po 3 sekundach',
                    isLoading: false,
                  });
                }
              }),
            ),
          ),
          catchError(() => {
            patchState(store, { error: 'Błąd inicjalizacji', isLoading: false });
            return EMPTY;
          }),
        ),
      ),

      listenToConnectionStatus: rxMethod<void>(
        pipe(
          switchMap(() => signalRService.connectionStatus),
          tap((status) => methods.setConnectionStatus(status)),
        ),
      ),

      listenToStockUpdates: rxMethod<void>(
        pipe(
          switchMap(() => signalRService.stockUpdates),
          tap((stock) => methods.updateStock(stock)),
        ),
      ),

      listenToAllStocks: rxMethod<void>(
        pipe(
          switchMap(() => signalRService.allStocks),
          tap((stocks) => {
            methods.setStocks(stocks);
            patchState(store, { isLoading: false });
          }),
        ),
      ),

      loadStocksHttp: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => signalRService.getStocksHttp()),
          tap((stocks) => {
            methods.setStocks(stocks);
            patchState(store, { isLoading: false });
          }),
          catchError(() => {
            patchState(store, { error: 'Nie udało się załadować danych', isLoading: false });
            return EMPTY;
          }),
        ),
      ),

      refresh: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => from(signalRService.getStocksHttp())),
          tap((stocks) => {
            methods.setStocks(stocks);
            patchState(store, { isLoading: false });
          }),
          catchError(() => {
            patchState(store, { error: 'Nie udało się odświeżyć', isLoading: false });
            return EMPTY;
          }),
        ),
      ),
    };

    return methods;
  }),
);
