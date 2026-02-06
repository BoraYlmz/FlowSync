import logging
from pathlib import Path

# Logs klasörü yoksa oluştur
log_path = Path("logs")
log_path.mkdir(exist_ok=True)

# Logger konfigürasyonu
logging.basicConfig(
    filename=log_path / "app.log",
    level=logging.WARNING,  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger()