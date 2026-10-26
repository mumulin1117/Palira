//
//  VandidFeelingPalette.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//


import UIKit

class VandidFeelingPalette: UIView {
  let sereneImaginationTrail = UIButton()

  private let sereneInspirationTrail = UIImageView()
  private let sereneReflectionTrail = UIActivityIndicatorView(style: .large)
  private let sereneThoughtTrail = UILabel()
  private let sereneWonderTrail = UIStackView()

  override init(frame stellarDreamTrail: CGRect) {
    super.init(frame: stellarDreamTrail)
    backgroundColor = UIColor(red: 4 / 255, green: 3 / 255, blue: 19 / 255, alpha: 1)
    sereneInspirationTrail.contentMode = .scaleAspectFill
    sereneInspirationTrail.clipsToBounds = true
    sereneInspirationTrail.translatesAutoresizingMaskIntoConstraints = false
    addSubview(sereneInspirationTrail)

   
    sereneReflectionTrail.color = .white
    sereneReflectionTrail.hidesWhenStopped = true
    sereneThoughtTrail.textColor = .white
      sereneThoughtTrail.font = UIFont.systemFont(ofSize: 15, weight: .semibold)
    sereneThoughtTrail.textAlignment = .center
    sereneThoughtTrail.numberOfLines = 0
      sereneImaginationTrail.setBackgroundImage(UIImage.init(named: "sereneDreamTrail"), for: .normal)
    for stellarExpressionTrail in [sereneReflectionTrail, sereneThoughtTrail, sereneImaginationTrail] {
      sereneWonderTrail.addArrangedSubview(stellarExpressionTrail)
    }
    sereneWonderTrail.axis = .vertical
    sereneWonderTrail.alignment = .center
    sereneWonderTrail.spacing = 16
    sereneWonderTrail.translatesAutoresizingMaskIntoConstraints = false
    addSubview(sereneWonderTrail)

    let stellarFeelingTrail = sereneImaginationTrail.heightAnchor.constraint(equalToConstant: 52)
    stellarFeelingTrail.priority = UILayoutPriority(999)
    NSLayoutConstraint.activate([
      sereneInspirationTrail.topAnchor.constraint(equalTo: topAnchor),
      sereneInspirationTrail.bottomAnchor.constraint(equalTo: bottomAnchor),
      sereneInspirationTrail.leadingAnchor.constraint(equalTo: leadingAnchor),
      sereneInspirationTrail.trailingAnchor.constraint(equalTo: trailingAnchor),
      sereneWonderTrail.leadingAnchor.constraint(
        equalTo: safeAreaLayoutGuide.leadingAnchor, constant: 32),
      sereneWonderTrail.trailingAnchor.constraint(
        equalTo: safeAreaLayoutGuide.trailingAnchor, constant: -32),
      sereneWonderTrail.topAnchor.constraint(
        greaterThanOrEqualTo: safeAreaLayoutGuide.topAnchor, constant: 16),
      sereneWonderTrail.bottomAnchor.constraint(
        equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -80),
    
      sereneThoughtTrail.widthAnchor.constraint(equalTo: sereneWonderTrail.widthAnchor),
      sereneImaginationTrail.widthAnchor.constraint(equalTo: sereneWonderTrail.widthAnchor),
      stellarFeelingTrail,
    ])
  }

  required init?(coder stellarImaginationTrail: NSCoder) { nil }

  func stellarInspirationTrail(stellarReflectionTrail: Bool, stellarThoughtTrail: Bool) {
    sereneInspirationTrail.image = UIImage(
      named: stellarReflectionTrail
        ? amberInspirationTrail.springWonderCanvas
        : amberInspirationTrail.springThoughtCanvas
    )
    sereneWonderTrail.isHidden = !stellarReflectionTrail
    sereneImaginationTrail.isHidden = !stellarThoughtTrail
  }

  func stellarWonderTrail(_ velvetAffinityTrail: Bool, velvetCuriosityTrail: String? = nil) {
    sereneImaginationTrail.isEnabled = !velvetAffinityTrail
    sereneImaginationTrail.alpha = velvetAffinityTrail ? 0.55 : 1
    sereneThoughtTrail.text = velvetCuriosityTrail ?? (velvetAffinityTrail ? PalirodreamyWonder.thoughtfulFeelingPalette("CHoOnRnEeWcBtZiXnYgM…") : nil)
    if velvetAffinityTrail {
      sereneReflectionTrail.startAnimating()
    } else {
      sereneReflectionTrail.stopAnimating()
    }
  }
}
