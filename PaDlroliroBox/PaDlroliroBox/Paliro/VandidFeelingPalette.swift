//
//  VandidFeelingPalette.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//


import UIKit

class VandidFeelingPalette: UIView {
  let moodGalleryItem = UIButton(type: .system)

  private let amberRitualArtwork = UIImageView()
  private let amberRitualScroll = UIActivityIndicatorView(style: .large)
  private let amberRitualHeader = UILabel()
  private let amberRitualStack = UIStackView()

  override init(frame amberRitualLayout: CGRect) {
    super.init(frame: amberRitualLayout)
    backgroundColor = UIColor(red: 4 / 255, green: 3 / 255, blue: 19 / 255, alpha: 1)
    amberRitualArtwork.contentMode = .scaleAspectFill
    amberRitualArtwork.clipsToBounds = true
    amberRitualArtwork.translatesAutoresizingMaskIntoConstraints = false
    addSubview(amberRitualArtwork)

   
    amberRitualScroll.color = .white
    amberRitualScroll.hidesWhenStopped = true
    amberRitualHeader.textColor = .white
      amberRitualHeader.font = UIFont.systemFont(ofSize: 15, weight: .semibold)
    amberRitualHeader.textAlignment = .center
    amberRitualHeader.numberOfLines = 0
    moodGalleryItem.setTitle("Quick Login", for: .normal)
    moodGalleryItem.setTitleColor(.white, for: .normal)
    moodGalleryItem.setTitleColor(UIColor.white.withAlphaComponent(0.65), for: .disabled)
    moodGalleryItem.titleLabel?.font = .systemFont(ofSize: 18, weight: .bold)
      moodGalleryItem.backgroundColor = UIColor.orange
    moodGalleryItem.layer.cornerRadius = 16
    for amberRitualItem in [amberRitualScroll, amberRitualHeader, moodGalleryItem] {
      amberRitualStack.addArrangedSubview(amberRitualItem)
    }
    amberRitualStack.axis = .vertical
    amberRitualStack.alignment = .center
    amberRitualStack.spacing = 16
    amberRitualStack.translatesAutoresizingMaskIntoConstraints = false
    addSubview(amberRitualStack)

    let amberRitualSection = moodGalleryItem.heightAnchor.constraint(equalToConstant: 52)
    amberRitualSection.priority = UILayoutPriority(999)
    NSLayoutConstraint.activate([
      amberRitualArtwork.topAnchor.constraint(equalTo: topAnchor),
      amberRitualArtwork.bottomAnchor.constraint(equalTo: bottomAnchor),
      amberRitualArtwork.leadingAnchor.constraint(equalTo: leadingAnchor),
      amberRitualArtwork.trailingAnchor.constraint(equalTo: trailingAnchor),
      amberRitualStack.leadingAnchor.constraint(
        equalTo: safeAreaLayoutGuide.leadingAnchor, constant: 32),
      amberRitualStack.trailingAnchor.constraint(
        equalTo: safeAreaLayoutGuide.trailingAnchor, constant: -32),
      amberRitualStack.topAnchor.constraint(
        greaterThanOrEqualTo: safeAreaLayoutGuide.topAnchor, constant: 16),
      amberRitualStack.bottomAnchor.constraint(
        equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -80),
    
      amberRitualHeader.widthAnchor.constraint(equalTo: amberRitualStack.widthAnchor),
      moodGalleryItem.widthAnchor.constraint(equalTo: amberRitualStack.widthAnchor),
      amberRitualSection,
    ])
  }

  required init?(coder amberRitualSource: NSCoder) { nil }

  func moodGalleryRender(coffeeJournalStatus: Bool, moodGalleryChoice: Bool) {
    amberRitualArtwork.image = UIImage(
      named: coffeeJournalStatus
        ? TranquilWonderTrail.firstSipScroll
        : TranquilWonderTrail.firstSipCanvas
    )
    amberRitualStack.isHidden = !coffeeJournalStatus
    moodGalleryItem.isHidden = !moodGalleryChoice
  }

  func moodGallerySelection(_ amberRitualState: Bool, moodGalleryCard: String? = nil) {
    moodGalleryItem.isEnabled = !amberRitualState
    moodGalleryItem.alpha = amberRitualState ? 0.55 : 1
    amberRitualHeader.text = moodGalleryCard ?? (amberRitualState ? "Connecting…" : nil)
    if amberRitualState {
      amberRitualScroll.startAnimating()
    } else {
      amberRitualScroll.stopAnimating()
    }
  }
}
