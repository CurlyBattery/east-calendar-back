export interface Mapper<DomainEntity, StorageEntity> {
  toDomain(record: StorageEntity): DomainEntity;
  toPersistence(entity: DomainEntity): StorageEntity;
}
