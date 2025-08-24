import 'dart:async';
import 'dart:io';

import 'package:tracker_spend/services/api_server.dart';
import 'package:tracker_spend/services/database_service.dart';

Future<void> main() async {
  // Initialize Hive in a writable directory inside container
  final dataDir = Directory('/app/data');
  if (!await dataDir.exists()) {
    await dataDir.create(recursive: true);
  }
  await DatabaseService.initializeHeadless(dataDir.path);

  await ApiServer.start();
  print('API process waiting for termination signal (CTRL+C)');
  // Keep the process alive until SIGINT/SIGTERM
  final signals = <Stream<ProcessSignal>>[
    ProcessSignal.sigint.watch(),
    ProcessSignal.sigterm.watch(),
  ];
  await StreamGroup.merge(signals).first;
  await ApiServer.stop();
}

// Minimal StreamGroup implementation to avoid extra deps
class StreamGroup<T> {
  static Stream<T> merge<T>(Iterable<Stream<T>> streams) {
    final controller = StreamController<T>();
    final subscriptions = <StreamSubscription<T>>[];
    for (final stream in streams) {
      subscriptions.add(stream.listen(controller.add, onError: controller.addError));
    }
    controller.onCancel = () async {
      for (final sub in subscriptions) {
        await sub.cancel();
      }
    };
    return controller.stream;
  }
}


